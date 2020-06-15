import { Request } from './Request';
import { Response, View } from './Response';
import { Pattern, PatternRule } from './Pattern';

/**
 * The signature of the next route rule to invoke.
 * @param request The Request instance.
 * @param response The current Response instance.
 * @return The next Response instance.
 */
export type NextHandler = (request: Request, response: Response) => Response|Promise<Response>;

/**
 * The signature of a Route handler method.
 * @param request The Request instance.
 * @param response The current Response instance.
 * @param next The next method to invoke if the handler must not end the routing.
 * @return The very same input Response instance or a new one.
 */
export type RouteHandler = (request: Readonly<Request>, response: Readonly<Response>, next?: NextHandler) => Response|string|Promise<Response|string>;

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
     * Create a Route instance.
     * @param rule A RouteRule object.
     */
    constructor(rule: RouteRule) {
        super(rule);
        this.handler = rule.handler;
        this.view = rule.render;
    }

    /**
     * Run the route handler.
     * @param req The Request instance.
     * @param res The current Response instance.
     * @param next The next method to invoke if the handler must not end the routing.
     * @return The very same input Response instance or a new one.
     */
    exec(req: Request, res: Response, next?: NextHandler) {
        return this.handler?.(req, res, next);
    }
}
