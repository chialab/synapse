import type { Template } from '@chialab/dna';
import type { Request, RequestInit } from './Request';

/**
 * A template factory for the response's view.
 * @param request The request of the routing.
 * @param response The response for the request.
 * @param context The app context.
 * @returns A template to render.
 */
export type View = (request: Request, response: Response) => Template;

/**
 * A set of metatags to be set on the page.
 */
export type Meta = { [key: string]: string };

/**
 * A class representing the response for a new page request in the app.
 */
// biome-ignore lint/suspicious/noExplicitAny: We need to allow any data here
export class Response<T = any> {
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
     * Redirection request init options.
     */
    public redirectInit?: RequestInit;

    /**
     * The data bound to the response.
     */
    public data: T | null = null;

    protected _title?: string | undefined;

    /**
     * The title of the response.
     */
    public get title(): string | undefined {
        return this._childResponse?.title ?? this._title;
    }

    /**
     * Set the title of the response.
     * @deprecated Use setTitle() instead.
     */
    public set title(title: string | undefined) {
        this.setTitle(title);
    }

    protected _meta?: Meta | undefined;

    /**
     * The metadata associated to the response.
     */
    public get meta(): Meta | undefined {
        return this._childResponse?.meta ?? this._meta;
    }

    /**
     * Set the metadata associated to the response.
     * @deprecated Use setMeta() instead.
     */
    public set meta(meta: Meta | undefined) {
        this.setMeta(meta);
    }

    /**
     * The view of the response.
     */
    public view?: View;

    /**
     * The request to respond.
     */
    readonly request: Request;

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
        this._childResponse = child;
        return this._childResponse;
    }

    /**
     * Set the DNA template of the Response.
     * @param template The view to render.
     */
    setView(template: View): this {
        this.view = template;
        return this;
    }

    /**
     * Get stored data.
     * @param defaultValue Default value if missing data.
     */
    getData(defaultValue: T | null = null) {
        return this.data ?? defaultValue;
    }

    /**
     * Set data for the Response.
     * @param data Data to set.
     */
    setData(data: T): this {
        this.data = data;
        return this;
    }

    /**
     * Set the title of the Response.
     * @param title The string to set.
     */
    setTitle(title: string | undefined): this {
        this._title = title;
        if (this._childResponse) {
            this._childResponse.setTitle(title);
        }
        return this;
    }

    /**
     * Set metadata to be associated to the response.`
     * @param meta The metadata to set.
     */
    setMeta(meta: Meta | undefined): this {
        this._meta = meta;
        if (this._childResponse) {
            this._childResponse.setMeta(meta);
        }
        return this;
    }

    /**
     * Return the template to render in the app.
     * @returns The view to render.
     */
    render(): Template {
        return this.view?.(this.request, this);
    }

    /**
     * Trigger a redirect for the response.
     * @param path The new path to navigate.
     */
    redirect(path: string, init?: RequestInit): this {
        this.redirected = path;
        this.redirectInit = init;
        return this;
    }
}
