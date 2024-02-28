import { Middleware } from './Middleware';
import type { Request } from './Request';
import type { Meta, Response } from './Response';

export type TitleBuilder = (title: string | undefined, response: Response) => string;
export type MetaBuilder = (meta: Meta | undefined, response: Response) => Meta;

/**
 * Middleware to set the document title and meta tags upon navigation.
 */
export class DocumentMetaMiddleware extends Middleware {
    /**
     * Get the owner document.
     */
    protected document?: Document;

    /**
     * Title builder function.
     */
    protected titleBuilder: TitleBuilder;

    /**
     * Meta builder function.
     */
    protected metaBuilder: MetaBuilder;

    /**
     * Meta tags from last invocation.
     */
    protected currentMeta: Meta = {};

    /**
     * Middleware rule constructor.
     * @param doc The owner document.
     * @param titleBuilder The title builder function.
     * @param metaBuilder The meta builder function.
     */
    public constructor(doc: Document | undefined = document, titleBuilder?: TitleBuilder, metaBuilder?: MetaBuilder) {
        super({});

        this.document = doc;
        this.titleBuilder = titleBuilder || ((title) => title || '');
        this.metaBuilder = metaBuilder || ((meta) => meta || {});
    }

    /**
     * Set document title and meta tags.
     * @inheritdoc
     */
    public hookAfter(request: Readonly<Request>, response: Response): Response {
        this.setTitle(this.titleBuilder(response.title, response));
        this.setMeta(this.metaBuilder(response.meta, response));

        return response;
    }

    /**
     * Update title.
     * @param string The title string.
     */
    protected setTitle(title: string): void {
        if (this.document === undefined) {
            return;
        }

        this.document.title = title;
    }

    /**
     * Update meta tags.
     * @param current Metadata for current state.
     * @param previous Previous metadata.
     */
    protected setMeta(meta: Meta): void {
        if (this.document === undefined) {
            return;
        }

        const head = this.document.head;
        Object.entries(meta).forEach(([name, content]) => {
            let meta = head.querySelector(`meta[name="${name}"]`);
            if (meta !== null) {
                meta.setAttribute('content', content);

                return;
            }

            meta = head.ownerDocument.createElement('meta');
            meta.setAttribute('name', name);
            meta.setAttribute('content', content);
            head.appendChild(meta);
        });

        Object.keys(this.currentMeta)
            .filter((name) => !(name in meta))
            .forEach((name) => {
                const meta = head.querySelector(`meta[name="${name}"]`);
                if (meta !== null) {
                    meta.remove();
                }
            });
    }
}
