import { Url } from '@chialab/proteins';
import { TemplateItem, Component, window, property } from '@chialab/dna';
import { Request } from './Router/Request';
import { Response } from './Router/Response';
import { Router, PopStateData } from './Router/Router';

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
            'click a': function(this: App, event: Event, node?: Node) {
                return this.handleLink(event, node);
            },
            'animationstart': function(this: App) {
                this.activeAnimations++;
            },
            'animationend': function(this: App) {
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
     * The previous Router Response instance.
     */
    private previousResponse?: Response;

    /**
     * The current Router Request instance.
     */
    @property() request?: Request;

    /**
     * The current Router Response instance.
     */
    @property() response?: Response;

    /**
     * The direction of the navigation.
     */
    @property({
        type: String,
        attribute: 'navigation',
    }) navigationDirection?: NavigationDirection;

    /**
     * Start the routing of the application.
     * @param path The initial path to navigate.
     */
    async start(path?: string) {
        this.onPopState = this.onPopState.bind(this);
        this.navigationDirection = NavigationDirection.forward;
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
        let response = await this.router.start(this.history, path);
        this.navigationDirection = NavigationDirection.forward;
        this.response = response;
        return response;
    }

    /**
     * @inheritdoc
     */
    forceUpdate() {
        super.forceUpdate();
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
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
            this.previousResponse?.render() as TemplateItem,
            this.response?.render() as TemplateItem,
        ];
    }

    /**
     * Trigger a routing navition.
     * @param path The route path to navigate.
     * @return The response instance for the navigation.
     */
    navigate(path: string): Promise<Response> {
        return this.router.navigate(path);
    }

    /**
     * Handle click on anchors.
     * @param event The click event.
     * @param node The anchor node.
     */
    handleLink(event: Event, node?: Node) {
        let anchor = node as HTMLAnchorElement;
        let href = anchor.getAttribute('href');
        let target = anchor.getAttribute('target') || '_self';
        if (href && target === '_self' && !Url.isAbsoluteUrl(href)) {
            event.preventDefault();
            event.stopPropagation();
            this.navigate(href);
        }
    }

    /**
     * Handle popstate event from the router.
     * @param event The event triggered by the router.
     */
    private onPopState({ state, previous }: PopStateData) {
        if (previous) {
            this.navigationDirection = state.index < previous.index ?
                NavigationDirection.back :
                NavigationDirection.forward;
            this.previousResponse = previous.response;
        } else {
            this.navigationDirection = NavigationDirection.forward;
        }
        this.response = state.response;
    }

    /**
     * Remove the previous page if all animations ended.
     */
    private removePreviousResponse() {
        if (this.activeAnimations !== 0) {
            return;
        }
        if (this.previousResponse) {
            this.previousResponse = undefined;
            this.forceUpdate();
        }
    }
}
