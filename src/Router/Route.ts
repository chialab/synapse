import { Request } from './Request';
import { Response, ResponseTemplateFactory } from './Response';
import { Pattern, PatternRule } from './Pattern';

/**
 * The signature of the next route rule to invoke.
 * @param req The Request instance.
 * @param res The current Response instance.
 * @return The next Response instance.
 */
export type NextHandler = (req: Request, res: Response) => Response|Promise<Response>;

/**
 * The signature of a Route handler method.
 * @param req The Request instance.
 * @param res The current Response instance.
 * @param next The next method to invoke if the handler must not end the routing.
 * @return The very same input Response instance or a new one.
 */
export type RouteHandler = (req: Readonly<Request>, res: Readonly<Response>, next?: NextHandler) => Response|Promise<Response>;

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
    render? : ResponseTemplateFactory;
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
    private readonly templateFactory?: ResponseTemplateFactory;

    /**
     * Create a Route instance.
     * @param rule A RouteRule object.
     */
    constructor(rule: RouteRule) {
        super(rule);
        this.handler = rule.handler;
        this.templateFactory = rule.render;
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

    /**
     * Invoke route rendering when matched.
     * @param req The Request instance.
     * @param res The current Response instance.
     */
    render(req: Readonly<Request>, res: Readonly<Response>, content?: any) {
        return this.templateFactory?.(req, res, content);
    }
}
