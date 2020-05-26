import { Url } from '@chialab/proteins';
import { TemplateItem, Component, window, property } from '@chialab/dna';
import { Response } from './Router/Response';
import { Router } from './Router/Router';
import { RouteRule, Route } from './Router/Route';
import { MiddlewareRule, Middleware } from './Router/Middleware';

/**
 * A Web Component which handles routing.
 */
export class App extends Component {
    /**
     * A list of routes to connect.
     */
    @property({
        setter(routes: RouteRule[]) {
            if (routes) {
                return routes.map((rule) => new Route(rule));
            }
            return [];
        },
        observe(this: App, oldValue: Route[], newValue: Route[]) {
            this.connectRoutes(newValue, oldValue);
        },
    }) routes: Route[] = [];

    /**
     * A list of middlewares to connect.
     */
    @property({
        setter(middlewares: MiddlewareRule[]) {
            if (middlewares) {
                return middlewares.map((rule) => new Middleware(rule));
            }
            return [];
        },
        observe(this: App, oldValue: Middleware[], newValue: Middleware[]) {
            this.connectMiddlewares(newValue, oldValue);
        },
    }) middlewares: Middleware[] = [];

    /**
     * The Router instance for the application.
     */
    public router: Router = new Router(this.routes, this.middlewares);

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
     * Connect new routes to the router.
     * @param routes The new routes to set.
     * @param oldRoutes The old routes to disconnect.
     */
    private connectRoutes(routes: Route[], oldRoutes?: Route[]) {
        if (oldRoutes) {
            oldRoutes.forEach((route) => this.router.disconnect(route))
        }
        if (routes) {
            routes.forEach((route) => this.router.connect(route))
        }
    }

    /**
     * Connect new middlewares to the router.
     * @param middlewares The new middlewares to set.
     * @param oldMiddlewares The old middlewares to disconnect.
     */
    private connectMiddlewares(middlewares: Middleware[], oldMiddlewares?: Middleware[]) {
        if (oldMiddlewares) {
            oldMiddlewares.forEach((middleware) => this.router.disconnect(middleware))
        }
        if (middlewares) {
            middlewares.forEach((middleware) => this.router.middleware(middleware))
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
