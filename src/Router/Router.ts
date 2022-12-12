import type { MiddlewareRule, MiddlewareBeforeHandler, MiddlewareAfterHandler } from './Middleware';
import type { RequestInit } from './Request';
import type { ErrorHandler } from './ErrorHandler';
import type { RouteRule, RouteHandler, NextHandler } from './Route';
import type { State } from './State';
import type { History } from './History';
import { window } from '@chialab/dna';
import { Path, trimSlash, trimSlashStart } from './Path';
import { Request } from './Request';
import { Response } from './Response';
import { Route } from './Route';
import { Middleware } from './Middleware';
import { BrowserHistory } from './BrowserHistory';
import { Emitter } from '../Helpers/Emitter';
import DEFAULT_ERROR_HANDLER from './ErrorHandler';

/**
 * The options to pass to the router.
 */
export interface RouterOptions {
    base?: string;
    origin?: string;
    errorHandler?: ErrorHandler;
}

/**
 * Describe the popstate data.
 */
export interface PopStateData {
    state: State;
    previous: State;
}

/**
 * Default router origin.
 */
export const DEFAULT_ORIGIN = 'http://local';

/**
 * A router implementation for app navigation.
 */
export class Router extends Emitter {
    /**
     * Router history states.
     */
    private states: State[] = [];

    /**
     * The current state index in the history.
     */
    private index: number = 0;

    /**
     * The browser's history like implementation for state management.
     */
    private history?: History;

    /**
     * The router error handler.
     */
    protected errorHandler: ErrorHandler = DEFAULT_ERROR_HANDLER;

    /**
     * A list of routes connected to the router.
     */
    protected readonly connectedRoutes: Route[] = [];

    /**
     * A list of middlewares connected to the router.
     */
    protected readonly connectedMiddlewares: Middleware[] = [];

    /**
     * Current navigation promise.
     */
    #navigationPromise?: Promise<Response | null>;

    /**
     * Current request.
     */
    #currentRequest?: Request;

    /**
     * The origin of the router.
     */
    #origin: string = window.location.origin !== 'null' ? window.location.origin : 'http://local';

    /**
     * The origin of the router.
     */
    get origin() {
        return this.#origin;
    }

    /**
     * The base routing path.
     */
    #base: string = '/';

    /**
     * The base routing path.
     */
    get base() {
        return this.#base;
    }

    /**
     * The router is started.
     */
    get started() {
        return !!this.history;
    }

    /**
     * The current router state.
     */
    get state() {
        return this.states[this.index];
    }

    /**
     * The current router path.
     */
    get current() {
        return this.state?.path;
    }

    /**
     * Create a Router instance.
     * @param routes A list of routes to connect.
     * @param middlewares A list of middlewares to connect.
     */
    constructor(options: RouterOptions = {}, routes: (Route | RouteRule)[] = [], middlewares: (Middleware | MiddlewareRule)[] = []) {
        super();

        if (options.origin) {
            this.setOrigin(options.origin);
        }
        if (options.base) {
            this.setBase(options.base);
        }
        if (options.errorHandler) {
            this.setErrorHandler(options.errorHandler);
        }
        if (routes) {
            routes.forEach((route) => this.connect(route));
        }
        if (middlewares) {
            middlewares.forEach((middleware) => this.middleware(middleware));
        }
    }

    /**
     * Set the location origin of the router.
     * @param origin The origin value.
     */
    setOrigin(origin: string) {
        if (this.history) {
            throw new Error('Cannot set origin after router is started.');
        }
        this.#origin = trimSlash(origin);
    }

    /**
     * Set the routing url base.
     * @param base The base value.
     */
    setBase(base: string) {
        if (this.started) {
            throw new Error('Cannot set base after router is started.');
        }
        this.#base = base.indexOf('#') !== -1 ? `/${trimSlash(base)}` : `/${trimSlash(base.split('?')[0])}`;
    }

    /**
     * Set the error handler of the router.
     * @param errorHandler The error handler or undefined to restore the default error handler.
     */
    setErrorHandler(errorHandler?: ErrorHandler) {
        this.errorHandler = errorHandler ?? DEFAULT_ERROR_HANDLER;
    }

    /**
     * Handle a router navigation.
     * @param request The request to handle.
     * @return The final response instance.
     */
    async handle(request: Request, parentResponse?: Response): Promise<Response> {
        const routes = this.connectedRoutes;
        const middlewares = this.connectedMiddlewares;
        const pathname = this.pathFromUrl(request.url.href) as string;
        let response = new Response(request, parentResponse);

        for (let i = middlewares.length - 1; i >= 0; i--) {
            const middleware = middlewares[i];
            const params = middleware.matches(pathname);
            if (!params) {
                continue;
            }
            try {
                response = await middleware.hookBefore(request, response, params, this) || response;
            } catch (error) {
                request.reject(error as Error);
                throw error;
            }
            if (response.redirected != null) {
                request.resolve(response);
                return response;
            }
        }

        const starter: NextHandler = routes.reduceRight(
            (next: NextHandler, route) => async (req, res) => {
                if (res.redirected != null) {
                    return res;
                }
                const params = route.matches(pathname);
                if (params === false) {
                    return next(req, res, this);
                }
                req.setMatcher(route);
                req.setParams(params);
                const newResponse = await route.exec(req, res, next, this);
                if (newResponse.redirected) {
                    return newResponse;
                }
                res = newResponse;
                if (route.view) {
                    res.setView(route.view);
                }
                return res;
            },
            () => {
                throw new Error('Not found');
            }
        );

        try {
            response = (await starter(request, response, this)) ?? response;
        } catch (error) {
            request.reject(error as Error);
            throw error;
        }

        if (response.redirected != null) {
            request.resolve(response);
            return response;
        }

        for (let i = middlewares.length - 1; i >= 0; i--) {
            const middleware = middlewares[i];
            const params = middleware.matches(pathname);
            if (!params) {
                continue;
            }
            try {
                response = await middleware.hookAfter(request, response, params, this) || response;
            } catch (error) {
                request.reject(error as Error);
                throw error;
            }
            if (response.redirected != null) {
                request.resolve(response);
                return response;
            }
        }

        request.resolve(response);

        return response;
    }

    /**
     * Trigger a router navigation.
     * @param pathname The path to navigate.
     * @return The final response instance.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async navigate(pathname: string, init?: RequestInit, store: any = {}, trigger = true, force = false, parentRequest?: Request, parentResponse?: Response): Promise<Response | null> {
        return this.setCurrentNavigation(async () => {
            const path = new Path(this.origin, this.base, pathname);
            if (!this.shouldNavigate(path) && !force) {
                this.fragment(path.hash || '');
                return null;
            }

            const request = parentRequest ? parentRequest.child(path, init) : new Request(path, init);
            this.setCurrentRequest(request);

            let response: Response;
            try {
                response = await this.handle(request, parentResponse);
            } catch (error) {
                response = this.handleError(request, error as Error);
            }

            if (request !== this.#currentRequest) {
                throw new Error('Request aborted.');
            }

            const index = this.index + 1;
            const title = response.title || window.document.title;
            await this.pushState({
                url: response.redirected || path.url.href,
                path: path.href,
                index,
                title,
                request,
                response,
                store,
            }, trigger);

            if (response.redirected != null) {
                return this.replace(response.redirected, response.redirectInit, store, trigger, parentRequest, parentResponse);
            }

            return response;
        });
    }

    /**
     * Trigger a router navigation.
     * @param pathname The path to navigate.
     * @return The final response instance.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async replace(pathname: string, init?: RequestInit, store: any = {}, trigger = true, parentRequest?: Request, parentResponse?: Response): Promise<Response> {
        return this.setCurrentNavigation(async () => {
            const path = new Path(this.origin, this.base, pathname);
            const request = parentRequest ? parentRequest.child(path, init) : new Request(path, init);
            this.setCurrentRequest(request);

            let response: Response;
            try {
                response = await this.handle(request, parentResponse);
            } catch (error) {
                response = this.handleError(request, error as Error);
            }

            if (request !== this.#currentRequest) {
                throw new Error('Request aborted.');
            }

            const title = response.title || window.document.title;
            await this.replaceState({
                url: response.redirected || path.url.href,
                path: path.href,
                index: this.index,
                title,
                request,
                response,
                store,
            }, trigger);

            if (response.redirected != null) {
                return this.replace(response.redirected, response.redirectInit, store, trigger);
            }

            return response;
        }) as Promise<Response>;
    }

    /**
     * Refresh the state of the router.
     * Reset and re-start the navigation.
     * @param path The path to use to restart the router.
     * @return Resolve the navigation response.
     */
    refresh(path?: string) {
        this.reset();
        return this.replace(path || this.current || '/');
    }

    /**
     * Update page hash.
     * @param hash The hash to set.
     */
    fragment(hash: string) {
        if (this.history instanceof BrowserHistory) {
            if (window.location.hash !== hash) {
                window.location.hash = hash;
            }
        }
    }

    /**
     * Connect a middleware.
     * @param middleware A MiddlewareRule object.
     * @param path The path of the middleware rule.
     * @param after The middleware method to invoke after routing.
     * @param before The middleware method to invoke before routing.
     * @return The Middleware instance.
     */
    middleware(middleware: Middleware | MiddlewareRule): Middleware;
    middleware(path: string, after?: MiddlewareAfterHandler, before?: MiddlewareBeforeHandler): Middleware;
    middleware(middlewareOrPath: Middleware | MiddlewareRule | string, after?: MiddlewareAfterHandler, before?: MiddlewareBeforeHandler): Middleware {
        let middleware: Middleware;
        if (middlewareOrPath instanceof Middleware) {
            middleware = middlewareOrPath;
        } else if (typeof middlewareOrPath === 'string') {
            middleware = new Middleware({ pattern: middlewareOrPath, before, after });
        } else {
            middleware = new Middleware(middlewareOrPath);
        }
        this.connectedMiddlewares.push(middleware);
        this.connectedMiddlewares.sort((route1, route2) => route2.priority - route1.priority);
        return middleware;
    }

    /**
     * Connect a route.
     * @param route A RouteRule object.
     * @param path The path of the route rule.
     * @param handler The callback to exec when matched.
     * @return The Route instance.
     */
    connect(route: Route | RouteRule): Route;
    connect(path: string, handler: RouteHandler): Route;
    connect(routeOrPath: Route | RouteRule | string, handler?: RouteHandler): Route {
        let route: Route;
        if (routeOrPath instanceof Route) {
            route = routeOrPath;
        } else if (typeof routeOrPath === 'string') {
            if (!handler) {
                throw new Error(`Missing handler for "${routeOrPath}" route`);
            }
            route = new Route({ pattern: routeOrPath, handler });
        } else {
            route = new Route(routeOrPath);
        }
        this.connectedRoutes.push(route);
        this.connectedRoutes.sort((route1, route2) => route2.priority - route1.priority);
        return route;
    }

    /**
     * Disconnect a Route or a Middleware.
     * @param routeOrMiddleare The Route or the Middleware instance to disconnect.
     * @return It returns false if the given input is not connected.
     */
    disconnect(routeOrMiddleare: Route | Middleware): boolean {
        if (routeOrMiddleare instanceof Route) {
            const io = this.connectedRoutes.indexOf(routeOrMiddleare);
            if (io !== -1) {
                this.connectedRoutes.splice(io, 1);
                return true;
            }
        } else if (routeOrMiddleare instanceof Middleware) {
            const io = this.connectedMiddlewares.indexOf(routeOrMiddleare);
            if (io !== -1) {
                this.connectedMiddlewares.splice(io, 1);
                return true;
            }
        }
        return false;
    }

    /**
     * Bind the Router to a History model.
     * @param history The history model to bind.
     */
    async start(history: History, pathname?: string): Promise<Response> {
        this.reset();
        this.end();

        this.history = history;
        this.history.start();
        history.on('reset', this.onReset);
        history.on('popstate', this.onPopState);

        if (history instanceof BrowserHistory) {
            return this.replace(pathname || this.pathFromUrl(window.location.href) || '/');
        }

        return this.replace(pathname || '/');
    }

    /**
     * Unbind the Router from a History model (if bound).
     */
    end() {
        if (!this.history) {
            return;
        }
        this.history.off('popstate', this.onPopState);
        this.history.off('reset', this.onReset);
        this.history.end();
        delete this.history;
    }

    /**
     * Reset the router states stack.
     */
    reset() {
        this.history?.reset();
    }

    /**
     * Resolve a path to full url using origin and base.
     * @param pathname The path to resolve.
     *
     * @return The full url.
     */
    resolve(pathname: string, full = false) {
        const url = new Path(this.origin, this.base, pathname).url;
        if (full) {
            return url.href;
        }

        return `${url.pathname}${url.search}${url.hash}`;
    }

    /**
     * Extract the path from a full url.
     * @param uri The full url.
     * @return The path to navigate.
     */
    pathFromUrl(uri: string) {
        const url = new URL(uri, this.origin);
        if (url.origin !== this.origin) {
            return null;
        }

        const pathname = `/${trimSlashStart(url.pathname)}${url.search}${url.hash}`;
        if (pathname !== this.base && pathname.indexOf(this.base) !== 0) {
            return null;
        }
        const path = new Path(this.origin, this.base, `/${trimSlashStart(pathname.replace(this.base, ''))}`);
        return `${path.pathname}${path.search}`;
    }

    /**
     * Get the latest navigation promise.
     * @returns The navigation promise.
     */
    waitNavigation() {
        return this.#navigationPromise;
    }

    /**
     * Set the current navigation promise.
     * @param callback The navigation function.
     * @returns The navigation response.
     */
    private setCurrentNavigation(callback: () => Promise<Response | null>) {
        return this.#navigationPromise = callback();
    }

    /**
     * Set the current request.
     * @param request The request instance.
     */
    private setCurrentRequest(request: Request) {
        return this.#currentRequest = request;
    }

    /**
     * Handle thrown error during routing.
     * @param request The request of the routing.
     * @param error The thrown error.
     * @return An error response.
     */
    private handleError(request: Request, error: Error) {
        request.reject(error);
        let response = this.errorHandler(request, error, this);
        if (!(response instanceof Response)) {
            const view = response;
            response = new Response(request);
            response.setTitle(error.message);
            response.setView(view);
        }
        return response;
    }

    /**
     * Push the current Router state to the stack.
     * It updates History if bound.
     * @param state The state to add.
     */
    private async pushState(state: State, trigger = true) {
        const previous = this.states[this.index];
        this.index = state.index;
        this.states.splice(state.index, this.states.length, state);
        if (this.history) {
            this.history.pushState({
                url: state.url,
                title: state.title,
                index: state.index,
            }, state.title, state.url);
        }

        if (trigger) {
            await this.trigger('pushstate', {
                previous,
                state,
            });
        }
    }

    /**
     * Replace the current Router of the stack and remove next states.
     * It updates History if bound.
     * @param state The state to use as replacement.
     */
    private async replaceState(state: State, trigger = true) {
        const previous = this.states[this.index];
        this.states.splice(state.index, this.states.length, state);
        if (this.history) {
            this.history.replaceState({
                url: state.url,
                title: state.title,
                index: state.index,
            }, state.title, state.url);
        }

        if (trigger) {
            await this.trigger('replacestate', {
                previous,
                state,
            });
        }
    }

    /**
     * Handle history reset event.
     */
    private onReset = () => {
        this.states.splice(0, this.states.length);
        this.index = 0;
    };

    /**
     * Handle History pop state event.
     * @param state The new state (if exists).
     * @param path The path to navigate.
     */
    private onPopState = async (newState: State, path: Path | null = null) => {
        const previous = this.states[this.index];
        let state: State;
        if (path) {
            await this.replace(path.href, newState && newState.store, false);
            state = this.state;
        } else {
            state = this.states[newState.index];
            this.index = newState.index;
        }
        await this.trigger('popstate', {
            previous,
            state,
        });
    };

    /**
     * Check if the requested path should be navigated.
     * @param pathOrUrl The requested path or url.
     */
    private shouldNavigate(pathOrUrl: Path | URL) {
        if (!this.state) {
            return true;
        }
        if (pathOrUrl instanceof Path) {
            return this.state.path !== pathOrUrl.href;
        }
        return this.state.url !== pathOrUrl.href;
    }
}
