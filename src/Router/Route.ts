import type { Request } from './Request';
import type { View } from './Response';
import type { PatternRule } from './Pattern';
import type { Router } from './Router';
import { Response } from './Response';
import { Pattern } from './Pattern';

/**
 * The signature of the next route rule to invoke.
 * @param request The Request instance.
 * @param response The current Response instance.
 * @param router The current router instance.
 * @return The next Response instance.
 */
export type NextHandler = (request: Request, response: Response, router: Router) => Response|void|Promise<Response|void>;

/**
 * The signature of a Route handler method.
 * @param request The Request instance.
 * @param response The current Response instance.
 * @param next The next method to invoke if the handler must not end the routing.
 * @param router The current router instance.
 * @return The very same input Response instance or a new one.
 */
export type RouteHandler = (request: Readonly<Request>, response: Readonly<Response>, next: NextHandler, router: Router) => Response|string|void|Promise<Response|string|void>;

/**
 * The interface of a route rule.
 */
export interface RouteRule extends PatternRule {
    /**
     * The callback to exec when matched.
     */
    handler?: RouteHandler;

    /**
     * A factory that generates the template to use when matched.
     */
    render?: View;

    /**
     * The child router.
     */
    router?: Router;
}

/**
 * The Route class.
 */
export class Route extends Pattern {
    /**
     * The callback to exec when matched.
     */
    private readonly handler?: RouteHandler;

    /**
     * A factory that generates the template to use when matched.
     */
    readonly view?: View;

    /**
     * The child router.
     */
    readonly router?: Router;

    /**
     * Create a Route instance.
     * @param rule A RouteRule object.
     */
    constructor(rule: RouteRule) {
        super(rule);
        this.handler = rule.handler;
        this.view = rule.render;
        this.router = rule.router;
    }

    /**
     * Run the route handler.
     * @param request The Request instance.
     * @param response The current Response instance.
     * @param next The next method to invoke if the handler must not end the routing.
     * @param router The current router instance.
     * @return The very same input Response instance or a new one.
     */
    async exec(request: Request, response: Response, next: NextHandler, router: Router) {
        const data = await this.handler?.(request, response, next, router);
        if (data instanceof Response) {
            if (data !== response) {
                return data;
            }
        } else if (data) {
            response.redirect(data);
            return response;
        }
        if (this.router) {
            response.child(await this.router.navigate(request.params?._ || '/', {}, false, false, request, response));
        }

        return response;
    }
}
