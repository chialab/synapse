import type { PopStateData } from './Router/Router';
import type { RequestInit, RequestMethod } from './Router/Request';
import { Component, window, property, state, observe, listen, customElementPrototype } from '@chialab/dna';
import { Request } from './Router/Request';
import { Response } from './Router/Response';
import { Router, DEFAULT_ORIGIN } from './Router/Router';
import { NavigationDirection, History } from './Router/History';
import { BrowserHistory } from './Router/BrowserHistory';
import { isNode } from './Helpers/Env';
import { Page } from './Components/Page';

/**
 * A Web Component which handles routing.
 */
@customElementPrototype
export class App extends Component {
    /**
     * The origin of the application.
     */
    @property({
        type: String,
    })
    get origin(): string {
        if (this.getInnerPropertyValue('origin')) {
            return this.getInnerPropertyValue('origin');
        }
        if (window.location.origin && window.location.origin !== 'null') {
            return window.location.origin;
        }

        return DEFAULT_ORIGIN;
    }
    set origin(value: string) {
        this.setInnerPropertyValue('origin', value);
    }

    /**
     * The base url of the application.
     */
    @property({
        type: String,
    })
    get base(): string {
        return this.getInnerPropertyValue('base') || '/';
    }
    set base(value: string) {
        this.setInnerPropertyValue('base', value);
    }

    /**
     * The current Router Request instance.
     */
    @property({
        type: Request,
    }) request?: Request;

    /**
     * The current Router Response instance.
     */
    @property({
        type: Response,
    }) response?: Response;

    /**
     * Should auto start on connect.
     */
    @property({
        type: [Boolean, String],
    }) autostart: boolean | string = false;

    /**
     * The navigation direction.
     */
    @state({
        type: String,
        attribute: ':navigation',
        update: false,
    }) navigationDirection: NavigationDirection = NavigationDirection.forward;

    /**
     * The History instance for the application.
     */
    public history: History = isNode() ? new History() : new BrowserHistory();

    /**
     * The Router instance for the application.
     */
    public router: Router = new Router({
        origin: this.origin,
        base: this.base,
    });

    /**
     * @inheritdoc
     */
    connectedCallback() {
        super.connectedCallback();
        if (this.autostart) {
            this.start(typeof this.autostart === 'string' ? this.autostart : undefined);
        }
    }

    /**
     * @inheritdoc
     */
    render() {
        if (!this.response) {
            return null;
        }

        return <Page response={this.response} />;
    }

    /**
     * Start the routing of the application.
     * @param path The initial path to navigate.
     */
    async start(path?: string): Promise<Response | void> {
        const { router, history } = this;
        router.middleware({
            pattern: '*',
            priority: -Infinity,
            before: (req) => {
                this.request = req;
            },
        });
        router.on('popstate', this._onPopState);
        router.on('pushstate', this._onPopState);
        router.on('replacestate', this._onPopState);

        const response = await router.start(history, path);
        if (response) {
            this.response = response;
            return response;
        }
    }

    /**
     * Trigger a routing navigation.
     * @param path The route path to navigate.
     * @returns The response instance for the navigation.
     */
    navigate(path: string, init?: RequestInit): Promise<Response|null> {
        return this.router.navigate(path, init);
    }

    /**
     * Replace current navigation.
     * @param path The route path to navigate.
     * @returns The response instance for the navigation.
     */
    replace(path: string, init?: RequestInit): Promise<Response|null> {
        return this.router.replace(path, init);
    }

    /**
     * Anchors click listener.
     * @param event The click event.
     * @param node The anchor node.
     */
    @listen('click', 'a')
    protected _handleLink(event: Event, node?: Node) {
        if (!this.router.started) {
            return;
        }
        return this.handleLink(event, node as HTMLElement);
    }

    /**
     * Forms submit listener.
     * @param event The submit event.
     * @param node The form node.
     */
    @listen('submit', 'form')
    protected _handleSubmit(event: Event, node?: Node) {
        if (!this.router.started) {
            return;
        }
        return this.handleSubmit(event, node as HTMLFormElement);
    }

    /**
     * Handle click on anchors.
     * @param event The click event.
     * @param node The anchor node.
     */
    async handleLink(event: Event, node: HTMLElement) {
        const href = node.getAttribute('href');
        if (!href) {
            return;
        }

        const target = node.getAttribute('target') || '_self';
        if (target !== '_self') {
            return;
        }

        const path = this.router.pathFromUrl(href);
        if (!path) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        this.navigate(path);
    }

    /**
     * Handle submit on forms.
     * @param event The click event.
     * @param node The anchor node.
     */
    async handleSubmit(event: Event, node: HTMLFormElement) {
        const action = node.getAttribute('action');
        if (!action) {
            return;
        }

        const target = node.getAttribute('target') || '_self';
        if (target !== '_self') {
            return;
        }

        const path = this.router.pathFromUrl(action);
        if (!path) {
            return;
        }

        const method = node.getAttribute('method')?.toLowerCase() as RequestMethod;
        const data = new window.FormData(node);

        event.preventDefault();
        event.stopPropagation();
        if (method === 'get') {
            const params = new URLSearchParams(data as unknown as Record<string, string>);
            this.navigate(`${path.split('?')[0]}?${params}`);
        } else {
            this.navigate(path, {
                method,
                data,
            });
        }
    }

    /**
     * Popstate listener.
     * @param data Popstate data.
     */
    protected _onPopState = (data: PopStateData) => {
        this.request = data.state.request;
        this.onPopState(data);
        this.response = data.state.response;
    };

    /**
     * Handle popstate event from the router.
     * @param data The event triggered by the router.
     */
    onPopState(data: PopStateData) {
        const { state, previous } = data;
        if (previous) {
            this.navigationDirection = this.history.compareStates(previous, state);
        } else {
            this.navigationDirection = NavigationDirection.forward;
        }
    }

    /**
     * Trigger `onRequest` hook.
     */
    @observe('request')
    protected _onRequestChanged(oldValue: Request|undefined, newValue: Request) {
        this.onRequest(oldValue, newValue);
    }

    /**
     * Trigger `onRequest` hook.
     */
    @observe('response')
    protected _onResponseChanged(oldValue: Response|undefined, newValue: Response) {
        this.onResponse(oldValue, newValue);
    }

    /**
     * Hook for origin property changes.
     */
    @observe('origin')
    protected _onOriginChanged() {
        if (this.router) {
            this.router.setOrigin(this.origin);
        }
    }

    /**
     * Hook for base property changes.
     */
    @observe('base')
    protected _onBaseChanged() {
        if (this.router) {
            let base = this.base;
            if (base[0] === '#') {
                base = `${window.location.pathname}${window.location.search}${base}`;
            }
            this.router.setBase(base);
        }
    }

    /**
     * Request changed hook.
     * @param oldValue The previous request object.
     * @param newValue The new request object.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onRequest(oldValue: Request|undefined, newValue: Request) {}

    /**
     * Response changed hook.
     * @param oldValue The previous response object.
     * @param newValue The new response object.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onResponse(oldValue: Response|undefined, newValue: Response) {}
}
