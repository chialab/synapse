import type { PopStateData } from './Router/Router';
import type { HyperNode } from '@chialab/dna';
import { Url } from '@chialab/proteins';
import { Component, window, property } from '@chialab/dna';
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
    private previousPage?: HyperNode;

    /**
     * The current Router Response render result.
     */
    private currentPage?: HyperNode;

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
        const currentPage = state.response?.render() as HyperNode;
        const previousKey = previousPage?.key;
        const currentKey = currentPage?.key;
        if ((previousKey || currentKey) && previousKey === currentKey) {
            this.previousPage = undefined;
        } else {
            this.previousPage = previousPage;
        }
        this.currentPage = currentPage;
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
