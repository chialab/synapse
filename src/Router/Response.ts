import { Template } from '@chialab/dna';
import { Router } from './Router';
import { Request } from './Request';

/**
 * A function that generate a DNA template for the response.
 * @param req The Request instance.
 * @param res The current Response instance.
 * @param context The context for the render.
 */
export type ResponseTemplateFactory = (req: Readonly<Request>, res: Readonly<Response>, context?: any) => Template;

/**
 * A class representing the response for a new page request in the app.
 */
export class Response {
    /**
     * The factory that generates the Response template.
     */
    private templateFactory: ResponseTemplateFactory = () => undefined;

    /**
     * Flag if the Response has been redirected.
     */
    public redirected?: boolean;

    /**
     * The data bound to the response.
     */
    public data: any;

    /**
     * Create a new Response instance.
     * @param router The Router instance of the request.
     * @param request The Request instance.
     */
    constructor(protected router: Router, private request: Request) { }

    /**
     * Set the DNA template of the Response.
     * @param templateFactory The factory that generates the template.
     */
    setView(templateFactory: ResponseTemplateFactory) {
        this.templateFactory = templateFactory;
    }

    /**
     * Return the template to render in the app.
     * @param context The context of the render.
     * @return The template to render.
     */
    render(context: any): Template {
        return this.templateFactory(this.request, this, context);
    }

    /**
     * Trigger a redirect for the response.
     * @param path The new path to navigate.
     * @return The new navigation Promise.
     */
    redirect(path: string) {
        this.redirected = true;
        return this.router.navigate(path);
    }
}
