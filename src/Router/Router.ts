import { window } from '@chialab/dna';
import { Request } from './Request';
import { Response } from './Response';
import { RouteRule, RouteHandler, Route, NextHandler } from './Route';
import { Middleware, MiddlewareRule, MiddlewareBeforeHandler, MiddlewareAfterHandler } from './Middleware';

/**
 * A router implementation for app navigation.
 */
export class Router {
    /**
     * The browser's history like implementation for state management.
     */
    protected readonly history: History = window.history;

    /**
     * A list of routes connected to the router.
     */
    protected readonly connectedRoutes: Route[] = [];

    /**
     * A list of middlewares connected to the router.
     */
    protected readonly connectedMiddlewares: Middleware[] = [];

    /**
     * The current router path.
     * @TODO get it from the history.
     */
    current?: string;

    /**
     * Create a Router instance.
     * @param routes A list of routes to connect.
     * @param middlewares A list of middlewares to connect.
     */
    constructor(routes: (Route|RouteRule)[] = [], middlewares: (Middleware|MiddlewareRule)[] = []) {
        if (routes) {
            routes.forEach((route) => this.connect(route));
        }
        if (middlewares) {
            middlewares.forEach((middleware) => this.middleware(middleware));
        }
    }

    /**
     * Trigger a router navigation.
     * @param path The path to navigate.
     * @return The final response instance.
     */
    async navigate(path: string): Promise<Response> {
        this.current = path;

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
                    res = await route.exec(req, res, next) ?? res;
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
}
