import type { PatternRule } from './Pattern';
import type { RequestParams } from './Request';
import type { Router } from './Router';
import { Request } from './Request';
import { Response } from './Response';
import { Pattern } from './Pattern';

/**
 * The signature of middleware handler to invoke before routing.
 * @param request The request instance.
 * @param response The current response instance.
 * @param params Middleware params extracted from the Request path.
 * @param router The current router instance.
 * @return The Response instance.
 */
export type MiddlewareBeforeHandler = (request: Request, response: Response, params: RequestParams, router: Router) => Response|Promise<Response>|void;

/**
 * The signature of middleware handler to invoke after routing.
 * @param request The request instance.
 * @param response The current response instance.
 * @param params Middleware params extracted from the Request path.
 * @param router The current router instance.
 * @return The Response instance.
 */
export type MiddlewareAfterHandler = (request: Readonly<Request>, response: Response, params: RequestParams, router: Router) => Response|Promise<Response>;

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
     * @param request The Request instance.
     * @param response The current Response instance.
     * @param params Middleware params extracted from the Request path.
     * @param router The current router instance.
     * @return The very same input Response instance or a new one.
     */
    hookBefore(request: Request, response: Response, params: RequestParams, router: Router) {
        return this.before?.(request, response, params, router);
    }

    /**
     * Exec the after hook method.
     * @param request The Request instance.
     * @param response The current Response instance.
     * @param params Middleware params extracted from the Request path.
     * @param router The current router instance.
     * @return The very same input Response instance or a new one.
     */
    hookAfter(request: Readonly<Request>, response: Response, params: RequestParams, router: Router) {
        return this.after?.(request, response, params, router);
    }
}
