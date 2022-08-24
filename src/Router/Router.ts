import type { MiddlewareRule, MiddlewareBeforeHandler, MiddlewareAfterHandler } from './Middleware';
import type { RequestInit } from './Request';
import type { ErrorHandler } from './ErrorHandler';
import type { RouteRule, RouteHandler, NextHandler } from './Route';
import type { State } from './State';
import { on, Factory, off } from '@chialab/proteins';
import { window } from '@chialab/dna';
import { Request } from './Request';
import { Response } from './Response';
import { Route } from './Route';
import { Middleware } from './Middleware';
import DEFAULT_ERROR_HANDLER from './ErrorHandler';

/**
 * The options to pass to the router.
 */
export interface RouterOptions {
    base?: string;
    prefix?: string;
    origin?: string;
    errorHandler?: ErrorHandler;
    listenHashChanges?: boolean;
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
 * Trim slashes from the start and end of a string.
 * @param token The string to trim.
 * @return THe trimmed string.
 */
function trimSlash(token: string) {
    return token
        .replace(/\/*$/, '')
        .replace(/^\/*/, '');
}

/**
 * Router instances counter.
 */
let instances = 0;

function generateId() {
    return `${Date.now()}-${instances++}`;
}

/**
 * A router implementation for app navigation.
 */
export class Router extends Factory.Emitter {
    /**
     * Router history states.
     */
    private states: State[] = [];

    /**
     * The current state index in the history.
     */
    private index: number = 0;

    /**
     * The callback bound to popstate event.
     */
    private onPopStateCallback: (event: PopStateEvent) => unknown = () => { };

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
     * The prefix for routing path such as hasbang.
     */
    #prefix: string = '';

    /**
     * The prefix for routing path such as hasbang.
     */
    get prefix() {
        return this.#prefix;
    }

    /**
     * Should navigate on hash changes.
     */
    #listeningHashChanges: boolean = false;

    /**
     * Should navigate on hash changes.
     */
    get listeningHashChanges() {
        return this.#listeningHashChanges;
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
        if (!this.state) {
            return null;
        }
        return this.pathFromUrl(this.state.url);
    }

    /**
     * The unique id of the router.
     */
    #id?: string;

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
        if (options.prefix) {
            this.setPrefix(options.prefix);
        }
        if (options.listenHashChanges) {
            this.listenHashChanges();
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
        this.#base = `/${trimSlash(base.split('?')[0])}`;
    }

    /**
     * Set the routing url prefix.
     * @param prefix The prefix value.
     */
    setPrefix(prefix: string) {
        if (this.started) {
            throw new Error('Cannot set prefix after router is started.');
        }
        this.#prefix = trimSlash(prefix);
    }

    /**
     * Configure the router to listen for hash changes.
     */
    listenHashChanges() {
        if (this.history) {
            throw new Error('Cannot change hash listener after router is started.');
        }
        this.#listeningHashChanges = true;
    }

    /**
     * Configure the router to not listen for hash changes.
     */
    unlistenHashChanges() {
        if (this.history) {
            throw new Error('Cannot change hash listener after router is started.');
        }
        this.#listeningHashChanges = false;
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
        const path = this.pathFromUrl(request.url.href) as string;
        let response = new Response(request, parentResponse);

        for (let i = middlewares.length - 1; i >= 0; i--) {
            const middleware = middlewares[i];
            const params = middleware.matches(path);
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
                const params = route.matches(path);
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
            const params = middleware.matches(path);
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
     * @param path The path to navigate.
     * @return The final response instance.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async navigate(path: string, init?: RequestInit, store: any = {}, trigger = true, force = false, parentRequest?: Request, parentResponse?: Response): Promise<Response | null> {
        return this.setCurrentNavigation(async () => {
            const url = new URL(this.resolve(path, true));
            if (!this.shouldNavigate(url) && !force) {
                const hash = url.hash;
                this.fragment(hash || '');
                return null;
            }

            const request = parentRequest ? parentRequest.child(url, init) : new Request(url, init);
            let response: Response;
            try {
                response = await this.handle(request, parentResponse);
            } catch (error) {
                response = this.handleError(request, error as Error);
            }

            const index = this.index + 1;
            const title = response.title || window.document.title;
            await this.pushState({
                id: this.#id as string,
                url: response.redirected || url.href,
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
     * @param path The path to navigate.
     * @return The final response instance.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async replace(path: string, init?: RequestInit, store: any = {}, trigger = true, parentRequest?: Request, parentResponse?: Response): Promise<Response> {
        return this.setCurrentNavigation(async () => {
            const url = new URL(this.resolve(path, true));
            const request = parentRequest ? parentRequest.child(url, init) : new Request(url, init);
            let response: Response;
            try {
                response = await this.handle(request, parentResponse);
            } catch (error) {
                response = this.handleError(request, error as Error);
            }

            const title = response.title || window.document.title;
            await this.replaceState({
                id: this.#id as string,
                url: response.redirected || url.href,
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
        if (window.history === this.history) {
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
    async start(history: History, path?: string): Promise<Response> {
        this.reset();
        this.end();
        this.history = history;

        if (history === window.history) {
            this.onPopStateCallback = (event: PopStateEvent) => {
                const state = event.state as unknown as State;
                if (state &&
                    typeof state === 'object' &&
                    typeof state.index === 'number') {
                    let path: string|undefined;
                    if (state.id !== this.#id) {
                        this.reset();
                        path = this.pathFromUrl(state.url) || undefined;
                    }
                    return this.onPopState(state, path);
                }

                const location = new URL(window.location.href);
                const path = this.pathFromUrl(location.href);
                if (!path) {
                    return;
                }

                if (!this.shouldNavigate(location)) {
                    event.preventDefault();
                    return;
                }

                return this.onPopState(state, path);
            };

            window.addEventListener('popstate', this.onPopStateCallback);
        } else {
            on(history, 'popstate', this.onPopStateCallback);
        }

        if (history === window.history) {
            return this.replace(path || this.pathFromUrl(window.location.href) || '/');
        }

        return this.replace(path || '/');
    }

    /**
     * Unbind the Router from a History model (if bound).
     */
    end() {
        if (!this.history) {
            return;
        }
        window.removeEventListener('popstate', this.onPopStateCallback);
        off(this.history, 'popstate', this.onPopStateCallback);
        delete this.history;
    }

    /**
     * Reset the router states stack.
     */
    reset() {
        this.#id = generateId();
        this.states.splice(0, this.states.length);
        this.index = 0;
    }

    /**
     * Resolve a path to full url using origin and base.
     * @param path The path to resolve.
     *
     * @return The full url.
     */
    resolve(path: string, full = false) {
        const uri = new URL(this.buildFullUrl(path), this.origin);
        if (full) {
            return uri.href;
        }

        return `${uri.pathname}${uri.search}${uri.hash}`;
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
        if (url.pathname !== this.base && url.pathname.indexOf(this.base) !== 0) {
            return null;
        }
        return `/${trimSlash(url.pathname.replace(this.base, ''))}${url.search}${url.hash}`;
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
                id: state.id,
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
                id: state.id,
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
     * Handle History pop state event.
     * @param state The new state (if exists).
     * @param path The path to navigate.
     */
    private async onPopState(newState: State, path?: string) {
        const previous = this.states[this.index];
        let state: State;
        if (typeof path === 'string') {
            await this.replace(path || '/', newState && newState.store, false);
            state = this.state;
        } else {
            state = this.states[newState.index];
            this.index = newState.index;
        }
        await this.trigger('popstate', {
            previous,
            state,
        });
    }

    /**
     * Build the full url combining base url, prefix and path.
     * @param path The internal route path.
     * @return The full url of the routing.
     */
    private buildFullUrl(path: string) {
        return `/${[this.base, this.prefix, path]
            .map((chunk) => trimSlash(chunk))
            .filter((chunk) => !!chunk)
            .join('/')}`;
    }

    /**
     * Check if the requested path should be navigated.
     * @param url The requested url.
     */
    private shouldNavigate(url: URL) {
        if (!this.state) {
            return true;
        }
        if (this.listeningHashChanges) {
            return this.state.url !== url.href;
        }

        return this.state.url.split('#')[0] !== url.href.split('#')[0];
    }
}
