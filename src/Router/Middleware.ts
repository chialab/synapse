import { Request, RequestParams } from './Request';
import { Response } from './Response';
import { Pattern, PatternRule } from './Pattern';

/**
 * The signature of middleware handler to invoke before routing.
 * @param req The request instance.
 * @param res The current response instance.
 * @return The Response instance.
 */
export type MiddlewareBeforeHandler = (req: Request, res: Response, params: RequestParams) => Response|Promise<Response>|void;

/**
 * The signature of middleware handler to invoke after routing.
 * @param req The request instance.
 * @param res The current response instance.
 * @return The Response instance.
 */
export type MiddlewareAfterHandler = (req: Readonly<Request>, res: Response, params: RequestParams) => Response|Promise<Response>;

/**
 * The interface of a middleware rule.
 */
export interface MiddlewareRule extends PatternRule {
    /**
     * The callback to exec before routing.
     */
    before?: MiddlewareBeforeHandler;

    /**
     * The callback to exec after routing.
     */
    after?: MiddlewareAfterHandler;
}

/**
 * The Middleware class.
 */
export class Middleware extends Pattern {
    /**
     * The callback to exec before routing.
     */
    private readonly before?: MiddlewareBeforeHandler;

    /**
     * The callback to exec after routing.
     */
    private readonly after?: MiddlewareAfterHandler;

    /**
     * Create a Middleware instance.
     * @param rule A MiddlewareRule object.
     */
    constructor(rule: MiddlewareRule) {
        super(rule);
        this.before = rule.before;
        this.after = rule.after;
    }

    /**
     * Exec the before hook method.
     * @param req The Request instance.
     * @param res The current Response instance.
     * @param params Middleware params extracted from the Request path.
     * @return The very same input Response instance or a new one.
     */
    hookBefore(req: Request, res: Response, params: RequestParams) {
        return this.before?.(req, res, params);
    }

    /**
     * Exec the after hook method.
     * @param req The Request instance.
     * @param res The current Response instance.
     * @param params Middleware params extracted from the Request path.
     * @return The very same input Response instance or a new one.
     */
    hookAfter(req: Readonly<Request>, res: Response, params: RequestParams) {
        return this.after?.(req, res, params);
    }
}
