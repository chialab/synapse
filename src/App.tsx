import { Component, listen, observe, property, state } from '@chialab/dna';
import { Page } from './Components/Page';
import { History, NavigationDirection } from './Router/History';
import type { Middleware } from './Router/Middleware';
import type { RequestInit, RequestMethod } from './Router/Request';
import { Request } from './Router/Request';
import { Response } from './Router/Response';
import type { Route } from './Router/Route';
import { Router } from './Router/Router';
import type { State } from './Router/State';

/**
 * A Web Component which handles routing.
 */
export class App extends Component {
    /**
     * Default routes to connect.
     */
    public static routes: Route[] = [];

    /**
     * Default middlewares to connect.
     */
    public static middlewares: Middleware[] = [];

    /**
     * The origin of the application.
     */
    @property({
        type: String,
    })
    origin?: string;

    /**
     * The base url of the application.
     */
    @property({
        type: String,
    })
    base?: string;

    /**
     * The History instance for the application.
     */
    @property({
        type: History,
    })
    get history(): History {
        return this.getInnerPropertyValue('history');
    }
    set history(history: History) {
        if (this.router && this.router.running) {
            throw new Error('Cannot change application router while running.');
        }
        this.setInnerPropertyValue('history', history);
    }

    /**
     * The Router instance for the application.
     */
    @property({
        type: Router,
    })
    get router(): Router {
        return this.getInnerPropertyValue('router');
    }
    set router(router: Router) {
        if (this.router && this.router.running) {
            throw new Error('Cannot change application router while running.');
        }
        this.setInnerPropertyValue('router', router);
    }

    /**
     * Routes to connect.
     */
    @property({
        type: Array,
    })
    get routes(): Route[] {
        return this.getInnerPropertyValue('routes');
    }
    set routes(routes: Route[]) {
        if (this.router && this.router.running) {
            throw new Error('Cannot change application router while running.');
        }
        this.setInnerPropertyValue('routes', routes);
    }

    /**
     * Middlewares to connect.
     */
    @property({
        type: Array,
    })
    get middlewares(): Middleware[] {
        return this.getInnerPropertyValue('middlewares');
    }
    set middlewares(middlewares: Middleware[]) {
        if (this.router && this.router.running) {
            throw new Error('Cannot change application router while running.');
        }
        this.setInnerPropertyValue('middlewares', middlewares);
    }

    /**
     * Should auto start on connect.
     */
    @property({
        type: [Boolean, String],
    })
    autostart: boolean | string = false;

    /**
     * The current Router Request instance.
     */
    @state({
        type: Request,
    })
    request?: Request;

    /**
     * The current Router Response instance.
     */
    @state({
        type: Response,
    })
    response?: Response;

    /**
     * The navigation direction.
     */
    @state({
        type: String,
        attribute: ':navigation',
        update: false,
    })
    navigationDirection: NavigationDirection = NavigationDirection.forward;

    /**
     * List of routes added by the app.
     */
    private connectedAppRoutes: (Route | Middleware)[] = [];

    /**
     * @inheritdoc
     */
    initialize() {
        super.initialize();

        this.routes = (this.constructor as typeof App).routes;
        this.middlewares = (this.constructor as typeof App).middlewares;
        if (!this.history) {
            this.history = new History();
        }
        if (!this.router) {
            this.router = new Router();
            this._onRouterChanged(undefined, this.router);
        }
    }

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
        const router = this.router;
        if (router.running) {
            throw new Error('Application has already started');
        }

        router.on('popstate', this._onPopState);
        router.on('pushstate', this._onPopState);
        router.on('replacestate', this._onPopState);

        const response = await router.start(path);
        if (response) {
            this.response = response;
            return response;
        }
    }

    /**
     * Stop the router.
     */
    stop() {
        this.router.off('popstate', this._onPopState);
        this.router.off('pushstate', this._onPopState);
        this.router.off('replacestate', this._onPopState);
        this.router.stop();
    }

    /**
     * Trigger a routing navigation.
     * @param path The route path to navigate.
     * @returns The response instance for the navigation.
     */
    navigate(path: string, init?: RequestInit): Promise<Response | null> {
        return this.router.navigate(path, init);
    }

    /**
     * Replace current navigation.
     * @param path The route path to navigate.
     * @returns The response instance for the navigation.
     */
    replace(path: string, init?: RequestInit): Promise<Response | null> {
        return this.router.replace(path, init);
    }

    /**
     * Anchors click listener.
     * @param event The click event.
     * @param node The anchor node.
     */
    @listen('click', 'a')
    protected _handleLink(event: Event, node?: Node) {
        if (!this.router.running) {
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
        if (event.defaultPrevented) {
            return;
        }
        if (!this.router.running) {
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
        if (event.defaultPrevented) {
            return;
        }
        if (!this.router.running) {
            throw new Error('Application has not started yet');
        }

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
        if (!this.router.running) {
            throw new Error('Application has not started yet');
        }

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
    protected _onPopState = (data: { state: State; previous?: State }) => {
        if (!data.state) {
            return;
        }
        this.request = data.state.request;
        this.onPopState(data);
        this.response = data.state.response;
    };

    /**
     * Handle popstate event from the router.
     * @param data The event triggered by the router.
     */
    onPopState(data: { state: State; previous?: State }) {
        const { state, previous } = data;
        if (this.history && state && previous) {
            this.navigationDirection = this.history.compareStates(previous, state);
        } else {
            this.navigationDirection = NavigationDirection.forward;
        }
    }

    /**
     * Trigger `onRequest` hook.
     */
    @observe('request')
    protected _onRequestChanged(oldValue: Request | undefined, newValue: Request) {
        this.onRequest(oldValue, newValue);
    }

    /**
     * Trigger `onRequest` hook.
     */
    @observe('response')
    protected _onResponseChanged(oldValue: Response | undefined, newValue: Response) {
        this.onResponse(oldValue, newValue);
    }

    /**
     * Hook for origin property changes.
     */
    @observe('origin')
    protected _onOriginChanged() {
        if (this.router) {
            this.router.setOrigin(this.origin || null);
        }
    }

    /**
     * Hook for base property changes.
     */
    @observe('base')
    protected _onBaseChanged() {
        if (this.router) {
            let base = this.base;
            if (base && base[0] === '#') {
                base = `${window.location.pathname}${window.location.search}${base}`;
            }
            this.router.setBase(base || null);
        }
    }

    /**
     * Hook for routes and middlewares property changes.
     */
    @observe('routes')
    @observe('middlewares')
    protected _onRoutesChanged() {
        if (this.router) {
            this.disconnectAppRoutes();
            this.connectAppRoutes();
        }
    }

    /**
     * Handle history changes.
     */
    @observe('history')
    protected _onHistoryChanged(oldHistory?: History, newHistory?: History) {
        if (this.router && newHistory) {
            this.router.setHistory(newHistory);
        }
    }

    /**
     * Handle router changes.
     */
    @observe('router')
    protected _onRouterChanged(oldRouter: Router | undefined, newRouter: Router) {
        if (this.origin) {
            newRouter.setOrigin(this.origin);
        }
        if (this.base) {
            newRouter.setBase(this.base);
        }
        if (this.history) {
            newRouter.setHistory(this.history);
        }
        this.disconnectAppRoutes(oldRouter);
        this.connectAppRoutes(newRouter);
    }

    protected disconnectAppRoutes(router: Router = this.router) {
        this.connectedAppRoutes.forEach((route) => {
            router.disconnect(route);
        });
        this.connectedAppRoutes = [];
    }

    protected connectAppRoutes(router: Router = this.router) {
        const { routes, middlewares } = this;
        routes.forEach((route) => {
            this.connectedAppRoutes.push(router.connect(route));
        });
        middlewares.forEach((middleware) => {
            this.connectedAppRoutes.push(router.middleware(middleware));
        });
        this.connectedAppRoutes.push(
            router.middleware({
                pattern: '*',
                priority: -Infinity,
                before: (req) => {
                    this.request = req;
                },
            })
        );
    }

    /**
     * Request changed hook.
     * @param oldValue The previous request object.
     * @param newValue The new request object.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onRequest(oldValue: Request | undefined, newValue: Request) {}

    /**
     * Response changed hook.
     * @param oldValue The previous response object.
     * @param newValue The new response object.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onResponse(oldValue: Response | undefined, newValue: Response) {}
}
