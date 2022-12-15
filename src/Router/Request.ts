import { Path } from './Path';
import type { Response } from './Response';
import type { Route } from './Route';

/**
 * A set of params extracted from the request path.
 */
export interface RequestParams {
    _?: string;
    [key: string]: string | undefined;
}

export type RequestMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options';

export interface RequestInit {
    path?: Path;
    method?: RequestMethod | Uppercase<RequestMethod>;
    data?: FormData|File;
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
    public readonly url: URL;

    /**
     * The requested path.
     */
    public readonly path: Path;

    /**
     * The parent request in case of subrouting.
     */
    public readonly parent?: Request;

    /**
     * The request method.
     */
    public readonly method: RequestMethod;

    /**
     * The request data.
     */
    public readonly data?: FormData|File;

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
     * @param url The url to navigate.
     * @param parent The parent request.
     */
    constructor(url: URL | string, init?: RequestInit, parent?: Request) {
        url = typeof url === 'string' ? new URL(url) : url;

        this.url = url;
        this.path = init?.path ?? new Path(`${url.pathname}${url.search}${url.hash}`);
        this.method = init?.method?.toLowerCase() as RequestMethod || 'get';
        this.data = init?.data;
        this.parent = parent;
    }

    /**
     * Create a child request for subrouting.
     * @param url The child url.
     */
    child(url: URL, init?: RequestInit) {
        return this._childRequest = new Request(url, init, this);
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
