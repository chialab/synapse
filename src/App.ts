import type { PopStateData } from './Router/Router';
import type { Template } from '@chialab/dna';
import { Url } from '@chialab/proteins';
import { Component, window, property, observe } from '@chialab/dna';
import { Request } from './Router/Request';
import { Response } from './Router/Response';
import { Router } from './Router/Router';
import { requestAnimationFrame } from './helpers';

enum NavigationDirection {
    back = 'back',
    forward = 'forward',
}

/**
 * A Web Component which handles routing.
 */
export class App extends Component {
    /**
     * @inheritdoc
     */
    static get listeners() {
        return {
            'click a'(this: App, event: Event, node?: Node) {
                return this.handleLink(event, node);
            },
            'animationstart'(this: App) {
                this.activeAnimations++;
            },
            'animationend'(this: App) {
                this.activeAnimations--;
                this.removePreviousResponse();
            },
        };
    }

    /**
     * The number of active animations.
     * Remove the previous Response only when its value is 0.
     */
    private activeAnimations: number = 0;

    /**
     * The History instance for the application.
     */
    public history: History = window.history;

    /**
     * The Router instance for the application.
     */
    public router: Router = new Router();

    /**
     * The previous Router Response render result.
     */
    private previousPage?: Template;

    /**
     * The current Router Response render result.
     */
    private currentPage?: Template;

    /**
     * The current Router Request instance.
     */
    @property() request?: Request;

    /**
     * The current Router Response instance.
     */
    @property() response?: Response;

    /**
     * Start the routing of the application.
     * @param path The initial path to navigate.
     */
    async start(path?: string) {
        this.setNavigation(NavigationDirection.forward);
        this.router.middleware({
            pattern: '*',
            priority: -Infinity,
            before: (req) => {
                this.request = req;
            },
        });
        this.router.on('popstate', this.onPopState);
        this.router.on('pushstate', this.onPopState);
        this.router.on('replacestate', this.onPopState);
        const response = await this.router.start(this.history, path);
        this.response = response;
        return response;
    }

    /**
     * @inheritdoc
     */
    forceUpdate() {
        super.forceUpdate();
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                // after 2 raf, we are sure that animations started
                this.removePreviousResponse();
            });
        });
    }

    /**
     * @inheritdoc
     */
    render() {
        return [
            this.previousPage,
            this.currentPage,
        ];
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
     * Handle click on anchors.
     * @param event The click event.
     * @param node The anchor node.
     */
    async handleLink(event: Event, node?: Node) {
        const anchor = node as HTMLAnchorElement;
        const href = anchor.getAttribute('href');
        if (!href || Url.isAbsoluteUrl(href)) {
            return;
        }

        const target = anchor.getAttribute('target') || '_self';
        if (target !== '_self') {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        this.navigate(href);
    }

    /**
     * Handle popstate event from the router.
     * @param event The event triggered by the router.
     */
    private onPopState = ({ state, previous }: PopStateData) => {
        const previousPage = this.currentPage;
        if (previous && !previous.request.isSubRouteRequest(state.request)) {
            this.previousPage = previousPage;
        }
        this.currentPage = state.response?.render();
        if (previous) {
            this.setNavigation(state.index < previous.index ?
                NavigationDirection.back :
                NavigationDirection.forward);
        } else {
            this.setNavigation(NavigationDirection.forward);
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

    /**
     * Set navigation attribute.
     * @param direction Navigation direction.
     */
    private setNavigation(direction: NavigationDirection) {
        this.setAttribute(':navigation', direction);
    }

    /**
     * Remove the previous page if all animations ended.
     */
    private removePreviousResponse() {
        if (this.activeAnimations !== 0) {
            return;
        }
        if (this.previousPage) {
            this.previousPage = undefined;
            this.forceUpdate();
        }
    }
}
