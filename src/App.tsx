import type { PopStateData } from './Router/Router';
import { Url } from '@chialab/proteins';
import { Component, window, property, state, observe, listen } from '@chialab/dna';
import { Request } from './Router/Request';
import { Response } from './Router/Response';
import { Router } from './Router/Router';
import { Page } from './Components/Page';

enum NavigationDirection {
    back = 'back',
    forward = 'forward',
}

/**
 * A Web Component which handles routing.
 */
export class App extends Component {
    /**
     * The History instance for the application.
     */
    public history: History = window.history;

    /**
     * The Router instance for the application.
     */
    public router: Router = new Router();

    /**
     * The base url of the application.
     */
    @property({
        type: String,
    }) base?: string;

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
     * The navigation direction.
     */
    @state({
        type: String,
        attribute: ':navigation',
        update: false,
    }) navigationDirection: NavigationDirection = NavigationDirection.forward;

    /**
     * @inheritdoc
     */
    render() {
        if (!this.response) {
            return null;
        }

        return <Page key={this.response} response={this.response} />;
    }

    /**
     * Start the routing of the application.
     * @param path The initial path to navigate.
     */
    async start(path?: string) {
        if (this.base) {
            this.router.setBase(this.base);
        }
        this.router.middleware({
            pattern: '*',
            priority: -Infinity,
            before: (req) => {
                this.request = req;
            },
        });
        this.router.on('popstate', this._onPopState);
        this.router.on('pushstate', this._onPopState);
        this.router.on('replacestate', this._onPopState);
        const response = await this.router.start(this.history, path);
        this.response = response;
        return response;
    }

    /**
     * Trigger a routing navition.
     * @param path The route path to navigate.
     * @return The response instance for the navigation.
     */
    navigate(path: string): Promise<Response|null> {
        return this.router.navigate(path);
    }

    /**
     * Anchors click listener.
     * @param event The click event.
     * @param node The anchor node.
     */
    @listen('click', 'a')
    protected _handleLink(event: Event, node?: Node) {
        return this.handleLink(event, node as HTMLElement);
    }

    /**
     * Handle click on anchors.
     * @param event The click event.
     * @param node The anchor node.
     */
    async handleLink(event: Event, node: HTMLElement) {
        const href = node.getAttribute('href');
        if (!href || Url.isAbsoluteUrl(href)) {
            return;
        }

        const target = node.getAttribute('target') || '_self';
        if (target !== '_self') {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        this.navigate(href);
    }

    /**
     * Popstate listener.
     * @param data Popstate data.
     */
    protected _onPopState = (data: PopStateData) => this.onPopState(data);

    /**
     * Handle popstate event from the router.
     * @param data The event triggered by the router.
     */
    onPopState(data: PopStateData) {
        const { state, previous } = data;
        if (previous) {
            this.navigationDirection = state.index < previous.index ?
                NavigationDirection.back :
                NavigationDirection.forward;
        } else {
            this.navigationDirection = NavigationDirection.forward;
        }
        this.response = state.response;
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
