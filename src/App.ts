import { Url } from '@chialab/proteins';
import { TemplateItem, Component, window, property } from '@chialab/dna';
import { Response } from './Router/Response';
import { Router } from './Router/Router';

/**
 * A Web Component which handles routing.
 */
export class App extends Component {
    /**
     * The Router instance for the application.
     */
    public router: Router = new Router();

    /**
     * The last Router Response instance.
     */
    private previousResponse?: Response;

    /**
     * The current Router Response instance.
     */
    @property() response?: Response;

    /**
     * The number of active animations.
     * Remove the previous Response only when its value is 0.
     */
    private activeAnimations: number = 0;

    /**
     * @inheritdoc
     */
    get listeners() {
        return {
            'click a': this.handleLink,
            'animationstart': () => {
                this.activeAnimations++;
            },
            'animationend': () => {
                this.activeAnimations--;
                this.removePreviousResponse();
            },
        };
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
            this.previousResponse?.render(this.$) as TemplateItem,
            this.response?.render(this.$) as TemplateItem,
        ];
    }

    /**
     * Trigger a routing navition.
     * @param path The route path to navigate.
     * @return The response instance for the navigation.
     */
    async navigate(path: string): Promise<Response> {
        let response = await this.router.navigate(path);
        this.previousResponse = this.response;
        this.response = response;
        return response;
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
     * Remove the previous page if all animations ended.
     */
    private removePreviousResponse() {
        if (this.activeAnimations === 0 &&
            this.previousResponse) {
            this.previousResponse = undefined;
            this.forceUpdate();
        }
    }
}
