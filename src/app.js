import { Router } from 'chialab/router/src/router.js';
import { RegisterHelper } from 'chialab/sw-helpers/src/browser/register-helper.js';
import { CallbackHelper } from './helpers/callback.js';
import { View } from './view.js';
import { PagesHelper } from './helpers/pages.js';
import { ViewHelper } from './helpers/view.js';
import { I18NHelper } from './helpers/i18n.js';
import { CacheHelper } from './helpers/cache.js';
import { CssHelper } from './helpers/css.js';
import * as EXCEPTIONS from './exceptions.js';

export class App {
    constructor(element) {
        if (element) {
            this.bindTo(element);
        }
        CallbackHelper.define(this);
        this.i18n = new this.constructor.I18NHelper(this.i18nOptions);
        this.pagesDispatcher = new this.constructor.PagesHelper(this.element);
        if (this.serviceWorkerUrl) {
            this.sw = new RegisterHelper(
                this.serviceWorkerUrl,
                this.serviceWorkerOptions
            );
            this.sw.register().then(() => {
                this.cache = new this.constructor.CacheHelper(this.sw);
            });
        }
        this.router = new Router(this.routeOptions);
        for (let k in this.routeRules) {
            if (this.routeRules.hasOwnProperty(k)) {
                if (typeof this[this.routeRules[k]] === 'function') {
                    this.router.on(k, this[this.routeRules[k]].bind(this));
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

    get routeRules() {
        return {
            '/:controller/:action/*': 'route',
            '/:controller/:action': 'route',
            '/:controller': 'route',
            '*': 'notFoundException',
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
                    this.throwException(new EXCEPTIONS.ContentErrorException(err));
                });
            }
        }
        this.notFoundException();
        return Promise.reject();
    }

    notFoundException() {
        this.throwException(new EXCEPTIONS.ContentNotFoundException());
    }

    dispatchView(controller, controllerResponse) {
        const AppView = this.constructor.View;
        return new Promise((resolve) => {
            let view = new AppView(controller, controllerResponse);
            let oldPage = this.currentPage;
            this.currentView = view;
            this.pagesDispatcher.add(view, false).then((page) => {
                this.currentPage = page;
                let destroyPromise = oldPage ? oldPage.destroy() : Promise.resolve();
                this.debounce(() => {
                    destroyPromise.then(() => {
                        this.currentPage.show(!oldPage);
                        if (controller && controller.dispatchResolved) {
                            controller.dispatchResolved();
                        }
                        resolve();
                    });
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
        return this.router.navigate(url);
    }

    throwException(err) {
        if (err && err instanceof EXCEPTIONS.AppException) {
            this.debounce(() => {
                if (!this.handleException(err)) {
                    throw err;
                }
            });
        }
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
        return this.router.back();
    }

    forwardState() {
        return this.router.forward();
    }
}
