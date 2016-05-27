import { Router } from 'chialab/router/src/router.js';
import { CallbackManager } from 'chialab/callback-manager/src/callback-manager.js';
import { PagesHelper } from './helpers/pages.js';
import { ViewHelper } from './helpers/view.js';
import { I18NHelper } from './helpers/i18n.js';
import { CacheHelper } from './helpers/cache.js';

const manager = new CallbackManager();

export class App {
    constructor(element) {
        if (element) {
            this.bindTo(element);
        }
        this.i18n = new this.constructor.I18NHelper(this.i18nOptions);
        this.pagesDispatcher = new this.constructor.PagesHelper(this.element);
        if (this.serviceWorkerUrl) {
            this.cache = new this.constructor.CacheHelper(
                this.serviceWorkerUrl, this.serviceWorkerOptions);
        }
        this.router = new Router(this.routeOptions);
        for (let k in this.routeRoules) {
            if (this.routeRoules.hasOwnProperty(k)) {
                if (typeof this[this.routeRoules[k]] === 'function') {
                    this.router.on(k, this[this.routeRoules[k]].bind(this));
                }
            }
        }
        this.debounce(this.router.start.bind(this.router));
    }

    static get ViewHelper() {
        return ViewHelper;
    }

    static get PagesHelper() {
        return PagesHelper;
    }

    static get I18NHelper() {
        return I18NHelper;
    }

    static get CacheHelper() {
        return CacheHelper;
    }

    static addStyle(css) {
        let style = document.createElement('style');
        style.type = 'text/css';
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
        document.head.appendChild(style);
    }

    get defaultRouteOptions() {
        return {
            dispatch: true,
        };
    }

    get routeOptions() {
        return this.defaultRouteOptions;
    }

    get routeRoules() {
        return {
            '/*/*/..': 'route',
            '/*/*': 'route',
            '..': 'route',
        };
    }

    get routeMap() {
        return {};
    }

    get i18nOptions() {
        return {};
    }

    ready() {
        return Promise.resolve();
    }

    bindTo(element) {
        this.element = element;
    }

    route(controller, action, paths = '') {
        paths = paths.split('/');
        if (controller) {
            let Controller = this.routeMap[controller];
            if (typeof Controller !== 'undefined') {
                let ctr = new Controller(this);
                ctr.ready.then(() => {
                    let promise;
                    if (action && typeof ctr[action] === 'function') {
                        promise = ctr[action].call(ctr, ...paths);
                    } else {
                        promise = ctr.exec(action, ...paths);
                    }
                    promise.then((ctrRes) =>
                        this.dispatchView(ctr, ctrRes)
                    );
                }, () => {
                    this.error();
                });
            } else {
                this.notFound();
            }
        }
    }

    dispatchView(controller, controllerResponse) {
        return new Promise((resolve) => {
            let ViewComponent = controllerResponse[0];
            let vars = controllerResponse[1];
            let content = new ViewComponent(controller);
            for (let k in vars) {
                if (vars.hasOwnProperty(k)) {
                    content[k] = vars[k];
                }
            }
            let oldPage = this.currentPage;
            let oldContent = this.currentContent = this.currentContent;
            this.currentPage = this.pagesDispatcher.add(content, false);
            if (oldPage) {
                oldContent.beforeDetachedCallback();
                this.pagesDispatcher.remove(oldPage);
            }
            this.debounce(() => {
                this.currentPage.show();
                if (controller.dispatchResolved) {
                    controller.dispatchResolved();
                }
                resolve();
            });
        });
    }

    debounce(callback) {
        setTimeout(() => {
            callback();
        }, 0);
    }

    navigate(url) {
        this.router.navigate(url);
    }

    notFound() {
        // NOT FOUND
    }

    error() {
        // ERROR
    }

    backState() {
        this.router.back();
    }
}

manager.attachToPrototype(App.prototype);
