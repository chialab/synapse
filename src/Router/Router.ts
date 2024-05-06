import { Emitter } from '../Helpers/Emitter';
import { BrowserHistory } from './BrowserHistory';
import DEFAULT_ERROR_HANDLER, { type ErrorHandler } from './ErrorHandler';
import { History, isStateful, type HistoryState } from './History';
import {
    Middleware,
    type MiddlewareAfterHandler,
    type MiddlewareBeforeHandler,
    type MiddlewareRule,
} from './Middleware';
import { Path, trimSlash, trimSlashStart } from './Path';
import { Request, type RequestInit } from './Request';
import { Response } from './Response';
import { Route, type NextHandler, type RouteHandler, type RouteRule } from './Route';
import type { State } from './State';

/**
 * The options to pass to the router.
 */
export interface RouterOptions {
    history?: History;
    base?: string;
    origin?: string;
    errorHandler?: ErrorHandler;
}

const DEFAULT_ORIGIN =
    window.location.origin && window.location.origin !== 'null' ? window.location.origin : 'http://local';
const DEFAULT_BASE = '/';

/**
 * A router implementation for app navigation.
 */
export class Router extends Emitter<{
    pushstate: [{ state: State; previous?: State }, void];
    replacestate: [{ state: State; previous?: State }, void];
    popstate: [{ state: State; previous?: State }, void];
}> {
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
     * The history object bound with the router.
     */
    #history: History = new History();

    /**
     * The browser's history like implementation for state management.
     */
    get history() {
        return this.#history;
    }

    /**
     * The origin of the router.
     */
    #origin: string = DEFAULT_ORIGIN;

    /**
     * The origin of the router.
     */
    get origin() {
        return this.#origin;
    }

    /**
     * The base routing path.
     */
    #base: string = DEFAULT_BASE;

    /**
     * The base routing path.
     */
    get base() {
        return this.#base;
    }

    /**
     * Running flag.
     */
    #running: boolean = false;

    /**
     * The router is running.
     */
    get running() {
        return this.#running;
    }

    /**
     * The router is started.
     * @deprecated Use `running` property.
     */
    get started() {
        return this.#running;
    }

    /**
     * The current router state.
     */
    get state() {
        if (!this.history) {
            return undefined;
        }
        return this.history.state;
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
    constructor(
        options: RouterOptions = {},
        routes: (Route | RouteRule)[] = [],
        middlewares: (Middleware | MiddlewareRule)[] = []
    ) {
        super();

        if (options.history) {
            this.setHistory(options.history);
        }
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
     * Set the history object of the router.
     * @param history The history instance.
     */
    setHistory(history: History) {
        if (this.running) {
            throw new Error('Cannot set history after router is started.');
        }
        this.#history = history;
    }

    /**
     * Set the location origin of the router.
     * @param origin The origin value.
     */
    setOrigin(origin: string | null) {
        if (this.running) {
            throw new Error('Cannot set origin after router is started.');
        }
        origin = origin ?? DEFAULT_ORIGIN;
        this.#origin = trimSlash(origin);
    }

    /**
     * Set the routing url base.
     * @param base The base value.
     */
    setBase(base: string | null) {
        if (this.running) {
            throw new Error('Cannot set base after router is started.');
        }
        base = base ?? DEFAULT_BASE;
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
     * @param parentResponse The request to handle.
     * @param data Initial response data.
     * @returns The final response instance.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected async handle(request: Request, parentResponse?: Response, data: any = null): Promise<Response> {
        const routes = this.connectedRoutes;
        const middlewares = this.connectedMiddlewares;
        const pathname = this.pathFromUrl(request.url.href) as string;
        let response = new Response(request, parentResponse);
        response.setData(data);

        for (let i = middlewares.length - 1; i >= 0; i--) {
            const middleware = middlewares[i];
            const params = middleware.matches(pathname);
            if (!params) {
                continue;
            }
            try {
                response = (await middleware.hookBefore(request, response, params, this)) || response;
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
                const newResponse = (await route.exec(req, res, next, this)) ?? res;
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
                response = (await middleware.hookAfter(request, response, params, this)) || response;
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
     * @param path The path to navigate.
     * @returns The final response instance.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async navigate(
        path: Path | string,
        init?: RequestInit,
        data: any = null,
        trigger = true,
        force = false,
        parentRequest?: Request,
        parentResponse?: Response
    ): Promise<Response | null> {
        return this.setCurrentNavigation(async () => {
            path = typeof path === 'string' ? new Path(path) : path;
            init = { ...init, path };

            const url = this.urlFromPath(path);
            if (!this.shouldNavigate(url) && !force) {
                this.fragment(url.hash || '');
                return null;
            }

            const request = parentRequest ? parentRequest.child(url, init) : new Request(url, init);
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

            if (response.redirected != null) {
                return this.replace(
                    response.redirected,
                    response.redirectInit,
                    data,
                    trigger,
                    parentRequest,
                    parentResponse
                );
            }

            const title = response.title || window.document.title;
            await this.pushState(
                {
                    url: response.redirected || url.href,
                    path: path.href,
                    title,
                    request,
                    response,
                    data: response.getData(),
                },
                trigger
            );

            return response;
        });
    }

    /**
     * Trigger a router navigation.
     * @param path The path to navigate.
     * @returns The final response instance.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async replace(
        path: Path | string,
        init?: RequestInit,
        data: any = null,
        trigger = true,
        parentRequest?: Request,
        parentResponse?: Response
    ): Promise<Response> {
        return this.setCurrentNavigation(async () => {
            path = typeof path === 'string' ? new Path(path) : path;
            init = { ...init, path };

            const url = this.urlFromPath(path);
            const request = parentRequest ? parentRequest.child(url, init) : new Request(url, init);
            this.setCurrentRequest(request);

            let response: Response;
            try {
                response = await this.handle(request, parentResponse, data);
            } catch (error) {
                response = this.handleError(request, error as Error);
            }

            if (request !== this.#currentRequest) {
                throw new Error('Request aborted.');
            }

            if (response.redirected != null) {
                return this.replace(response.redirected, response.redirectInit, data, trigger);
            }

            const title = response.title || window.document.title;
            await this.replaceState(
                {
                    url: response.redirected || url.href,
                    path: path.href,
                    title,
                    request,
                    response,
                    data: response.getData(),
                },
                trigger
            );

            return response;
        }) as Promise<Response>;
    }

    /**
     * Refresh the state of the router.
     * Reset and re-start the navigation.
     * @param path The path to use to restart the router.
     * @returns Resolve the navigation response.
     */
    refresh(path?: string) {
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
     * @returns The Middleware instance.
     */
    middleware(middleware: Middleware | MiddlewareRule): Middleware;
    middleware(path: string, after?: MiddlewareAfterHandler, before?: MiddlewareBeforeHandler): Middleware;
    middleware(
        middlewareOrPath: Middleware | MiddlewareRule | string,
        after?: MiddlewareAfterHandler,
        before?: MiddlewareBeforeHandler
    ): Middleware {
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
     * @returns The Route instance.
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
     * @returns It returns false if the given input is not connected.
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
    async start(pathname?: string): Promise<Response> {
        this.#running = true;
        this.history.start();
        this.history.on('popstate', this.onPopState);

        if (this.history instanceof BrowserHistory) {
            return this.replace(pathname || this.pathFromUrl(window.location.href) || '/');
        }

        return this.replace(pathname || '/');
    }

    /**
     * Unbind the Router from a History model (if bound).
     */
    stop() {
        this.#running = false;
        if (this.history) {
            this.history.off('popstate', this.onPopState);
            this.history.stop();
        }
    }

    /**
     * Unbind the Router from a History model (if bound).
     * @deprecated Use `stop` method instead.
     */
    end() {
        return this.stop();
    }

    /**
     * Resolve a path to full url using origin and base.
     * @param pathname The path to resolve.
     *
     * @returns The full url.
     */
    resolve(pathname: string, full = false) {
        const url = this.urlFromPath(pathname);
        if (full) {
            return url.href;
        }

        return `${url.pathname}${url.search}${url.hash || (this.base.endsWith('#') ? '#' : '')}`;
    }

    /**
     * Extract the path from a full url.
     * @param uri The full url.
     * @returns A path.
     */
    pathFromUrl(uri: URL | string) {
        const url = typeof uri === 'string' ? new URL(uri, this.origin) : uri;
        if (url.origin !== this.origin) {
            return null;
        }

        const pathname = `/${trimSlashStart(url.pathname)}${url.search}${url.hash || (url.href.endsWith('#') ? '#' : '')}`;
        if (pathname !== this.base && pathname.indexOf(this.base) !== 0) {
            return null;
        }
        const path = new Path(pathname.replace(this.base, ''));
        return `${path.pathname}${path.search}`;
    }

    /**
     * Get the full url from a path.
     * @param path The path.
     * @returns A url.
     */
    urlFromPath(path: Path | string) {
        return new URL(
            `/${[this.base, typeof path === 'string' ? path : path.href]
                .map((chunk) => trimSlash(chunk))
                .filter((chunk) => !!chunk)
                .join('/')}`,
            this.origin
        );
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
        return (this.#navigationPromise = callback());
    }

    /**
     * Set the current request.
     * @param request The request instance.
     */
    private setCurrentRequest(request: Request) {
        return (this.#currentRequest = request);
    }

    /**
     * Handle thrown error during routing.
     * @param request The request of the routing.
     * @param error The thrown error.
     * @returns An error response.
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
     * @param trigger Should trigger the event.
     */
    private async pushState(state: State, trigger = true) {
        const previous = this.state;
        if (this.history) {
            await this.history.pushState(state);
        }

        if (trigger) {
            await this.trigger('pushstate', {
                state,
                previous,
            });
        }
    }

    /**
     * Replace the current Router of the stack and remove next states.
     * It updates History if bound.
     * @param state The state to use as replacement.
     * @param trigger Should trigger the event.
     */
    private async replaceState(state: State, trigger = true) {
        const previous = this.state;
        if (this.history) {
            await this.history.replaceState(state);
        }

        if (trigger) {
            await this.trigger('replacestate', {
                previous,
                state,
            });
        }
    }

    /**
     * Handle History pop state event.
     * @param data Event data.
     */
    private onPopState = (entry: { state: State | HistoryState; previous?: State } | { url: string }) => {
        if (isStateful(entry)) {
            this.replace(entry.state.path, undefined, entry.state.data, false).then(() => {
                this.trigger('popstate', {
                    state: this.state as State,
                    previous: entry.previous,
                });
            });
        } else if (entry.url) {
            this.navigate(this.pathFromUrl(window.location.href) || '/');
        }
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
