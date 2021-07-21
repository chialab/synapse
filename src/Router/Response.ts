import type { Template } from '@chialab/dna';
import { Request } from './Request';

/**
 * A template factory for the response's view.
 * @param request The request of the routing.
 * @param response The response for the request.
 * @param context The app context.
 * @return A template to render.
 */
export type View = (request: Request, response: Response) => Template;

/**
 * A class representing the response for a new page request in the app.
 */
export class Response {
    private _childResponse?: Response | null;

    /**
     * The child response in case of subrouting.
     */
    get childResponse() {
        return this._childResponse;
    }

    /**
     * The parent response in case of subrouting.
     */
    public readonly parent?: Response;

    /**
     * Flag if the Response has been redirected.
     */
    public redirected?: string;

    /**
     * The data bound to the response.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public data: any;

    /**
     * The title of the response.
     */
    public title?: string;

    /**
     * The view of the response.
     */
    public view?: View;

    /**
     * The request to respond.
     */
    protected request: Request;

    /**
     * Create a Response object.
     * @param request The request to respond.
     */
    constructor(request: Request, parent?: Response) {
        this.request = request;
        if (parent) {
            this.parent = parent;
            this.setData(parent.getData());
        }
    }

    /**
     * Set the child response in case of subrouting.
     * @param child The child response.
     */
    child(child: Response | null) {
        return this._childResponse = child;
    }

    /**
     * Set the DNA template of the Response.
     * @param template The view to render.
     */
    setView(template: View) {
        this.view = template;
    }

    /**
     * Get stored data.
     */
    getData() {
        return this.data;
    }

    /**
     * Set data for the Response.
     * @param data Data to set.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setData(data: any) {
        this.data = data;
    }

    /**
     * Set the title of the Response.
     * @param title The string to set.
     */
    setTitle(title: string) {
        this.title = title;
    }

    /**
     * Return the template to render in the app.
     * @return The view to render.
     */
    render(): Template {
        return this.view?.(this.request, this);
    }

    /**
     * Trigger a redirect for the response.
     * @param path The new path to navigate.
     * @return The new navigation Promise.
     */
    redirect(path: string) {
        this.redirected = path;
    }
}
