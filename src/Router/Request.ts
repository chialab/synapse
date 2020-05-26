import { Router } from './Router';

/**
 * A set of params extracted from the request path.
 */
export interface RequestParams {
    [key: string]: string;
}

/**
 * A class representing a new page request in the app.
 */
export class Request<T extends RequestParams = RequestParams> {
    /**
     * A set of params extracted from the request path.
     */
    public params?: T = {} as T;

    /**
     * Create a Request instance.
     * @param router The Router instance of the request.
     * @param path The path to navigate.
     */
    constructor(protected router: Router, public path: string) { }

    /**
     * Set params to the request.
     * @param params The params to set.
     */
    set(params: T) {
        this.params = params;
    }
}
