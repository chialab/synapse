import type { MiddlewareRule, MiddlewareBeforeHandler, MiddlewareAfterHandler } from './Middleware';
import type { View } from './Response';
import type { RouteRule, RouteHandler, NextHandler } from './Route';
import type { State } from './State';
import { on, Factory, off, Url } from '@chialab/proteins';
import { window, html } from '@chialab/dna';
import { Request } from './Request';
import { Response } from './Response';
import { Route } from './Route';
import { Middleware } from './Middleware';

export type ErrorHandler = (request: Request, error: Error, router: Router) => Response|View;

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
 * Trim slashes from the start and end of a string.
 * @param token The string to trim.
 * @return THe trimmed string.
 */
function trimSlash(token: string) {
    return token
        .replace(/\/*$/, '')
        .replace(/^\/*/, '');
}

function formatStack(error: Error) {
    if (!error.stack) {
        return;
    }
    return html`<p>${error.stack
        .split(/^(.*)$/gm)
        .map((line) => html`<div>${line}</div>`)
    }</p>`;
}

/**
 * The default error handler.
 * @param request The request of the routing.
 * @param error The thrown error.
 * @return An error response object.
 */
const DEFAULT_ERROR_HANDLER = (request: Request, error: Error) => {
    const response = new Response(request);
    response.setTitle(error.message);
    response.setView(() => html`<div>
        <details>
            <summary style="color: red">${error.message}</summary>
            ${formatStack(error)}
        </details>
    </div>`);
    return response;
};

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
    private onPopStateCallback: (event: PopStateEvent) => unknown = () => {};

    /**
     * The browser's history like implementation for state management.
     */
    private history?: History;

    protected readonly errorHandler: ErrorHandler;

    /**
     * A list of routes connected to the router.
     */
    protected readonly connectedRoutes: Route[] = [];

    /**
     * A list of middlewares connected to the router.
     */
    protected readonly connectedMiddlewares: Middleware[] = [];

    /**
     * The origin of the router.
     */
    readonly origin: string;

    /**
     * The base routing path.
     */
    readonly base: string;

    /**
     * The prefix for routing path such as hasbang.
     */
    readonly prefix: string;

    /**
     * The id of the router.
     */
    readonly id: number;

    /**
     * Should navigate on hash changes.
     */
    readonly listenHashChanges: boolean;

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
        return this.state?.url;
    }

    /**
     * Create a Router instance.
     * @param routes A list of routes to connect.
     * @param middlewares A list of middlewares to connect.
     */
    constructor(options: RouterOptions = {}, routes: (Route | RouteRule)[] = [], middlewares: (Middleware | MiddlewareRule)[] = []) {
        super();

        this.id = Date.now();
        this.origin = trimSlash(options.origin || '');
        this.base = trimSlash(options.base || '');
        this.prefix = trimSlash(options.prefix || '');
        this.errorHandler = options.errorHandler ?? DEFAULT_ERROR_HANDLER;
        this.listenHashChanges = !!options.listenHashChanges;

        if (routes) {
            routes.forEach((route) => this.connect(route));
        }
        if (middlewares) {
            middlewares.forEach((middleware) => this.middleware(middleware));
        }
    }

    /**
     * Handle a router navigation.
     * @param request The request to handle.
     * @return The final response instance.
     */
    async handle(request: Request, parentResponse?: Response): Promise<Response> {
        const routes = this.connectedRoutes;
        const middlewares = this.connectedMiddlewares;
        let response = new Response(request, parentResponse);

        for (let i = middlewares.length - 1; i >= 0; i--) {
            const middleware = middlewares[i];
            const params = middleware.matches(request.url.pathname as string);
            if (!params) {
                continue;
            }
            try {
                response = await middleware.hookBefore(request, response, params, this) || response;
            } catch (error) {
                request.reject(error);
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
                const params = route.matches(request.url.pathname as string);
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
            response = await starter(request, response, this);
        } catch (error) {
            request.reject(error);
            throw error;
        }

        if (response.redirected != null) {
            request.resolve(response);
            return response;
        }

        for (let i = middlewares.length - 1; i >= 0; i--) {
            const middleware = middlewares[i];
            const params = middleware.matches(request.url.pathname as string);
            if (!params) {
                continue;
            }
            try {
                response = await middleware.hookAfter(request, response, params, this) || response;
            } catch (error) {
                request.reject(error);
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
    async navigate(path: string, store: any = {}, trigger = true, force = false, parentRequest?: Request, parentResponse?: Response): Promise<Response|null> {
        path = this.preparePath(path);
        if (!this.shouldNavigate(path) && !force) {
            const hash = new Url.Url(path, this.base).hash;
            this.fragment(hash || '');
            return null;
        }

        const request = parentRequest ? parentRequest.child(path) : new Request(path);
        let response: Response;
        try {
            response = await this.handle(request, parentResponse);
        } catch (error) {
            response = this.handleError(request, error);
        }

        const index = this.index + 1;
        const title = response.title || window.document.title;
        await this.pushState({
            id: this.id,
            url: response.redirected || path,
            index,
            title,
            request,
            response,
            store,
        }, trigger);

        if (response.redirected != null) {
            return this.replace(response.redirected, store, trigger, parentRequest, parentResponse);
        }

        return response;
    }

    /**
     * Trigger a router navigation.
     * @param path The path to navigate.
     * @return The final response instance.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async replace(path: string, store: any = {}, trigger = true, parentRequest?: Request, parentResponse?: Response): Promise<Response> {
        path = this.preparePath(path);

        const request = parentRequest ? parentRequest.child(path) : new Request(path);
        let response: Response;
        try {
            response = await this.handle(request, parentResponse);
        } catch (error) {
            response = this.handleError(request, error);
        }

        const title = response.title || window.document.title;
        await this.replaceState({
            id: this.id,
            url: response.redirected || path,
            index: this.index,
            title,
            request,
            response,
            store,
        }, trigger);

        if (response.redirected != null) {
            return this.replace(response.redirected, store, trigger);
        }

        return response;
    }

    /**
     * Refresh the state of the router.
     * Reset and re-start the navigation.
     * @param path The path to use to restart the router.
     * @return Resolve the navigation response.
     */
    refresh(path: string = this.current) {
        this.reset();
        return this.replace(path);
    }

    /**
     * Update page hash.
     * @param hash The hash to set.
     */
    fragment(hash: string) {
        if (window.history === this.history) {
            if (window.location.hash || hash) {
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
    connect(route: Route|RouteRule): Route;
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
    start(history: History, path?: string): Promise<Response> {
        this.reset();
        this.end();
        this.history = history;
        if (history === window.history) {
            this.onPopStateCallback = (event: PopStateEvent) => {
                const state = event.state as unknown as State;
                if (event.state &&
                    typeof event.state === 'object' &&
                    typeof event.state.index === 'number') {
                    return this.onPopState(state, state.id !== this.id ? state.url : undefined);
                }

                const location = trimSlash(this.getPathFromLocation());
                if (!this.shouldNavigate(location)) {
                    event.preventDefault();
                    return;
                }

                return this.onPopState(state, location);
            };
            window.addEventListener('popstate', this.onPopStateCallback);
            if (!path) {
                path = this.getPathFromLocation();
            }
        } else {
            on(this.history, 'popstate', this.onPopStateCallback);
        }

        return this.replace(path as string);
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
        this.states.splice(0, this.states.length);
        this.index = 0;
    }

    /**
     * Resolve a path to full url using origin and base.
     * @param path The path to resolve.
     *
     * @return The full url.
     */
    resolve(path: string) {
        return Url.join(this.origin, this.base || '/', trimSlash(path));
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
        const url = this.buildFullUrl(state.url);
        const previous = this.states[this.index];
        this.index = state.index;
        this.states.splice(state.index, this.states.length, state);
        if (this.history) {
            if (this.history === window.history) {
                window.document.title = state.title;
            }
            this.history.pushState({
                id: state.id,
                url: state.url,
                title: state.title,
                index: state.index,
            }, state.title, url);
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
        const url = this.buildFullUrl(state.url);
        const previous = this.states[this.index];
        this.states.splice(state.index, this.states.length, state);
        if (this.history) {
            if (this.history === window.history) {
                window.document.title = state.title;
            }
            this.history.replaceState({
                id: state.id,
                url: state.url,
                title: state.title,
                index: state.index,
            }, state.title, url);
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
        if (this.history === window.history) {
            window.document.title = state.title;
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
        let url = '/';
        if (this.base) {
            url += `${trimSlash(this.base)}/`;
        }
        if (this.prefix) {
            url += `${trimSlash(this.prefix)}/`;
        }
        url += trimSlash(path);
        return url;
    }

    /**
     * Prepare the path for the routing rule.
     * @param path The path to navigate.
     * @return The path ready for the navigation.
     */
    private preparePath(path: string) {
        return `/${trimSlash(path)}`;
    }

    /**
     * Extract the path from the browser location.
     * @return The path to navigate.
     */
    private getPathFromLocation() {
        let path = trimSlash(`${window.location.pathname}${window.location.search}${window.location.hash}`);
        if (this.base && path.indexOf(this.base) === 0) {
            path = trimSlash(path.replace(this.base, ''));
            if (this.prefix && path.indexOf(this.prefix) === 0) {
                path = trimSlash(path.replace(this.prefix, ''));
            }
        }
        return path;
    }

    /**
     * Check if the requested path should be navigated.
     * @param path The requested path.
     */
    private shouldNavigate(path: string) {
        if (!this.current) {
            return true;
        }

        path = trimSlash(path);
        let current = trimSlash(this.current);
        if (!this.listenHashChanges) {
            if (path[0] === '#') {
                return false;
            }

            path = path.split('#')[0];
            current = current.split('#')[0];
        }

        return path !== current;
    }
}
