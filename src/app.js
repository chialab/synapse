import { Router } from 'chialab/router/src/router.js';
import { CallbackManager } from 'chialab/callback-manager/src/callback-manager.js';
import { View } from './view.js';
import { PagesHelper } from './helpers/pages.js';
import { ViewHelper } from './helpers/view.js';
import { I18NHelper } from './helpers/i18n.js';
import { CacheHelper } from './helpers/cache.js';
import { CssHelper } from './helpers/css.js';
import * as EXCEPTIONS from './exceptions.js';

const manager = new CallbackManager();

export class App {
    constructor(element) {
        this.handleExceptions();
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
        this.debounce(() => {
            this.router.start();
        });
    }

    static get View() {
        return View;
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
        CssHelper.add(css);
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
        return {
            languages: [],
        };
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
                return ctr.ready.then(() => {
                    let promise;
                    if (action && typeof ctr[action] === 'function') {
                        promise = ctr[action].call(ctr, ...paths);
                    } else {
                        promise = ctr.exec(action, ...paths);
                    }
                    promise.then((ctrRes) =>
                        this.dispatchView(ctr, ctrRes)
                    , (err) => {
                        if (err instanceof Error) {
                            throw err;
                        }
                    });
                }, (err) => {
                    throw new EXCEPTIONS.ContentErrorException(err);
                });
            }
        }
        throw new EXCEPTIONS.ContentNotFoundException();
    }

    dispatchView(controller, controllerResponse) {
        const AppView = this.constructor.View;
        return new Promise((resolve) => {
            let content = new AppView(controller, controllerResponse);
            let oldPage = this.currentPage;
            let oldContent = this.currentContent;
            this.currentContent = content;
            this.currentPage = this.pagesDispatcher.add(content, false);
            let destroyPromise = Promise.resolve();
            if (oldPage) {
                if (oldContent) {
                    destroyPromise = oldContent.destroy();
                }
                this.pagesDispatcher.remove(oldPage);
            }
            this.debounce(() => {
                destroyPromise.then(() => {
                    this.currentPage.show(!oldContent);
                    if (controller.dispatchResolved) {
                        controller.dispatchResolved();
                    }
                    resolve();
                });
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

    handleExceptions() {
        window.onerror = (msg, url, lineNo, columnNo, error) => {
            if (error instanceof EXCEPTIONS.AppException) {
                return this.handleException(error);
            }
            return false;
        };
    }

    handleException(err) {
        if (err instanceof EXCEPTIONS.ContentNotFoundException) {
            this.notFound();
            return true;
        } else if (err instanceof EXCEPTIONS.ContentErrorException) {
            this.error();
            return true;
        }
        return false;
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
