import { on, Factory, off } from '@chialab/proteins';
import { window } from '@chialab/dna';
import { Request } from './Request';
import { Response } from './Response';
import { State } from './State';
import { RouteRule, RouteHandler, Route, NextHandler } from './Route';
import { Middleware, MiddlewareRule, MiddlewareBeforeHandler, MiddlewareAfterHandler } from './Middleware';

export interface RouterOptions {
    base?: string;
    prefix?: string;
}

export interface PopStateData {
    state: State,
    previous: State,
}

function trimSlash(token: string) {
    return token
        .replace(/\/*$/, '')
        .replace(/^\/*/, '');
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
    private onPopStateCallback = (event: any) => {};

    /**
     * The browser's history like implementation for state management.
     */
    private history?: History;

    /**
     * A list of routes connected to the router.
     */
    protected readonly connectedRoutes: Route[] = [];

    /**
     * A list of middlewares connected to the router.
     */
    protected readonly connectedMiddlewares: Middleware[] = [];

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
        this.base = trimSlash(options.base || '');
        this.prefix = trimSlash(options.prefix || '');

        if (routes) {
            routes.forEach((route) => this.connect(route));
        }
        if (middlewares) {
            middlewares.forEach((middleware) => this.middleware(middleware));
        }
    }

    /**
     * Handle a router navigation.
     * @param path The path to navigate.
     * @return The final response instance.
     */
    async handle(path: string): Promise<Response> {
        const routes = this.connectedRoutes;
        const middlewares = this.connectedMiddlewares;
        const request = new Request(this, path);
        let response = new Response(this, request);

        for (let i = middlewares.length - 1; i >= 0; i--) {
            let middleware = middlewares[i];
            let params = middleware.matches(path);
            if (!params) {
                continue;
            }
            response = await middleware.hookBefore(request, response, params) || response;
            if (response.redirected) {
                return response;
            }
        }

        const starter: NextHandler = routes.reduceRight(
            (next: NextHandler, route) => {
                return async (req, res) => {
                    if (res.redirected) {
                        return res;
                    }
                    let params = route.matches(path);
                    if (params === false) {
                        return next(req, res);
                    }
                    req.set(params);
                    try {
                        let data = await route.exec(req, res, next) ?? res;
                        if (data instanceof Response) {
                            res = data;
                        } else {
                            res.setData(data);
                        }
                    } catch (error) {
                        res.setError(error);
                    }
                    res.setView(route.render.bind(route));
                    return res;
                };
            },
            () => {
                throw new Error('Not found');
            }
        );

        response = await starter(request, response);

        if (response.redirected) {
            return response;
        }

        for (let i = middlewares.length - 1; i >= 0; i--) {
            let middleware = middlewares[i];
            let params = middleware.matches(path);
            if (!params) {
                continue;
            }
            response = await middleware.hookAfter(request, response, params) || response;
            if (response.redirected) {
                return response;
            }
        }

        return response;
    }

    /**
     * Trigger a router navigation.
     * @param path The path to navigate.
     * @return The final response instance.
     */
    async navigate(path: string, store: any = {}): Promise<Response> {
        path = this.preparePath(path);

        const response = await this.handle(path);
        if (response.redirected) {
            return response;
        }

        let index = this.index + 1;
        let title = response.title || window.document.title;
        this.pushState({
            id: this.id,
            url: path,
            index,
            title,
            response,
            store,
        });

        return response;
    }

    /**
     * Trigger a router navigation.
     * @param path The path to navigate.
     * @return The final response instance.
     */
    async replace(path: string, store: any = {}): Promise<Response> {
        path = this.preparePath(path);

        const response = await this.handle(path);
        if (response.redirected) {
            return response;
        }

        let title = response.title || window.document.title;
        this.replaceState({
            id: this.id,
            url: path,
            index: this.index,
            title,
            response,
            store,
        });

        return response;
    }

    refresh(path?: string, store?: any) {
        path = path || this.current;
        this.reset();
        return this.replace(path, store);
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
            let io = this.connectedRoutes.indexOf(routeOrMiddleare);
            if (io !== -1) {
                this.connectedRoutes.splice(io, 1);
                return true;
            }
        } else if (routeOrMiddleare instanceof Middleware) {
            let io = this.connectedMiddlewares.indexOf(routeOrMiddleare);
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
                let state = event.state as unknown as State;
                if (event.state &&
                    typeof event.state === 'object' &&
                    typeof event.state.index === 'number') {
                    return this.onPopState(state, state.id !== this.id ? state.url : undefined);
                }

                return this.onPopState(state, this.getPathFromLocation());
            };
            window.addEventListener('popstate', this.onPopStateCallback);
            if (!path) {
                path = this.getPathFromLocation();
            }
        } else {
            this.onPopStateCallback = this.onPopState.bind(this);
            on(history, 'popstate', this.onPopStateCallback);
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
        off(history, 'popstate', this.onPopStateCallback);
        delete this.history;
    }

    reset() {
        this.states.splice(0, this.states.length);
        this.index = 0;
    }

    /**
     * Push the current Router state to the stack.
     * It updates History if bound.
     * @param state The state to add.
     */
    private pushState(state: State) {
        let url = this.buildFullUrl(state.url);
        this.index = state.index;
        this.states.splice(state.index, this.states.length, state);
        if (this.history) {
            if (this.history === window.history) {
                document.title = state.title;
            }
            this.history.pushState({
                url: state.url,
                title: state.title,
                index: state.index,
            }, state.title, url);
        }
    }

    /**
     * Replace the current Router of the stack and remove next states.
     * It updates History if bound.
     * @param state The state to use as replacement.
     */
    private replaceState(state: State) {
        let url = this.buildFullUrl(state.url);
        this.states.splice(state.index, this.states.length, state);
        if (this.history) {
            if (this.history === window.history) {
                document.title = state.title;
            }
            this.history.replaceState({
                url: state.url,
                title: state.title,
                index: state.index,
            }, state.title, url);
        }
    }

    /**
     * Handle History pop state event.
     * @param state The new state (if exists).
     * @param path The path to navigate.
     */
    private async onPopState(newState: State, path?: string) {
        let previous = this.states[this.index];
        let state: State;
        if (typeof path === 'string') {
            await this.replace(path || '/', newState && newState.store);
            state = this.state;
        } else {
            state = this.states[newState.index];
            this.index = newState.index;
        }
        if (this.history === window.history) {
            document.title = state.title;
        }
        await this.trigger('popstate', {
            previous,
            state,
        });
    }

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

    private preparePath(path: string) {
        return `/${trimSlash(path)}`;
    }

    private getPathFromLocation() {
        let path = trimSlash(`${window.location.pathname}${window.location.hash}`);
        if (this.base && path.indexOf(this.base) === 0) {
            path = trimSlash(path.replace(this.base, ''));
            if (this.prefix && path.indexOf(this.prefix) === 0) {
                path = trimSlash(path.replace(this.prefix, ''));
            }
        }
        return path;
    }
}
