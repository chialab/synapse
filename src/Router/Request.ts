import type { Response } from './Response';
import type { Route } from './Route';
import { Url } from '@chialab/proteins';

/**
 * A set of params extracted from the request path.
 */
export interface RequestParams {
    _?: string;
    [key: string]: string | undefined;
}

/**
 * A class representing a new page request in the app.
 */
export class Request<T extends RequestParams = RequestParams> {
    private _childRequest?: Request;
    private _response?: Response;
    private _matcher?: Route;
    private _error?: Error;

    /**
     * The requested url.
     */
    public readonly url: Url.Url;

    /**
     * The parent request in case of subrouting.
     */
    public readonly parent?: Request;

    /**
     * A set of params extracted from the request path.
     */
    public params?: T = {} as T;

    /**
     * The resolving state of the request.
     */
    get resolving() {
        return !this.response && !this.error;
    }

    /**
     * The resolved state of the request.
     */
    get resolved() {
        return !!this.response || !!this.error;
    }

    /**
     * The child request in case of subrouting.
     */
    get childRequest() {
        return this._childRequest;
    }

    /**
     * The response instance for the request.
     */
    get response() {
        return this._response;
    }

    /**
     * The last matched route instance.
     */
    get matcher() {
        return this._matcher;
    }

    /**
     * The error instance for the request.
     */
    get error() {
        return this._error;
    }

    /**
     * Create a Request instance.
     * @param path The path to navigate.
     * @param parent The parent request.
     */
    constructor(path: string, parent?: Request) {
        this.url = new Url.Url(path);
        this.parent = parent;
    }

    /**
     * Create a child request for subrouting.
     * @param path The child request path.
     */
    child(path: string) {
        return this._childRequest = new Request(path, this);
    }

    /**
     * Set the matched route rule.
     * @param route The route rule.
     */
    setMatcher(route: Route) {
        this._matcher = route;
    }

    /**
     * Set params to the request.
     * @param params The params to set.
     */
    setParams(params: T) {
        this.params = params;
    }

    /**
     * Resolve the request.
     * @param res The response which resolves the request.
     */
    resolve(res: Response) {
        this._response = res;
    }

    /**
     * Mark the request as errored.
     * @param err The error which rejectes the request.
     */
    reject(err: Error) {
        this._error = err;
    }

    /**
     * Check if a request is a subrouter request.
     * @param request The current request.
     */
    isSubRouteRequest(request: Request) {
        const matcher = this.matcher;
        if (!matcher) {
            return false;
        }

        const router = matcher.router;
        if (!router) {
            return false;
        }

        return !!matcher.matches(request.url.pathname as string);
    }
}
