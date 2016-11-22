import { Router } from 'chialab-router/src/router.js';
import { internal } from './helpers/internal.js';
import { BaseObject } from './base.js';
import { Controller } from './controller.js';
import { View } from './view.js';
import { PagesHelper } from './helpers/pages.js';
import { I18NHelper } from './helpers/i18n.js';
import { CssHelper } from './helpers/css.js';
import { debounce } from './helpers/debounce.js';
import * as EXCEPTIONS from './exceptions.js';
import '@dnajs/idom/observer.js';

export class App extends BaseObject {
    static get View() {
        return View;
    }

    static get PagesHelper() {
        return PagesHelper;
    }

    static get I18NHelper() {
        return I18NHelper;
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
            '*': 'notFound',
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

    initialize(element) {
        super.initialize(element);
        this.router = new Router(this.routeOptions);
        this.registerRoutes();
        this.element = element;
        this.i18n = new this.constructor.I18NHelper(this.i18nOptions);
        internal(this).pagesDispatcher = new this.constructor.PagesHelper(this.element);
        this.element.addEventListener('click', (ev) => {
            let elem = ev.target;
            if (elem.tagName !== 'A') {
                elem = elem.closest('A');
            }
            if (elem && elem.tagName === 'A') {
                return this.handleLink(ev, elem, this);
            }
            return true;
        });
        this.ready()
            .then(() => {
                this.debounce(() => {
                    this.router.start();
                });
            })
            .catch((ex) => {
                // eslint-disable-next-line
                console.error(ex);
                // eslint-disable-next-line
                alert('Error occurred on application initialize.');
            });
    }

    registerRoutes(routeRules) {
        routeRules = routeRules || this.routeRules;
        for (let k in routeRules) {
            if (routeRules.hasOwnProperty(k)) {
                let ruleMatch = routeRules[k];
                if (typeof ruleMatch === 'string') {
                    if (typeof this[ruleMatch] === 'function') {
                        this.router.on(k, (...args) =>
                            this.beforeRoute(...args).then((args2) =>
                                this[ruleMatch].call(this, ...args2)
                                    .then(() => this.afterRoute())
                            )
                        );
                    }
                } else if (ruleMatch.prototype instanceof Controller) {
                    this.router.on(k, (...args) =>
                        this.beforeRoute(...args).then(() =>
                            this.dispatchController(ruleMatch)
                                .then((ctr) =>
                                    ctr.exec(...args).then((ctrRes) =>
                                        this.dispatchView(ctr, ctrRes)
                                    ).catch((err) =>
                                        this.throwException(err)
                                    )
                                )
                                .then(() => this.afterRoute())
                        )
                    );
                }
            }
        }
    }

    beforeRoute(...args) {
        return Promise.resolve(args || []);
    }

    afterRoute() {
        return Promise.resolve();
    }

    backState() {
        return this.router.back();
    }

    forwardState() {
        return this.router.forward();
    }

    handleLink() {
        return true;
    }

    route(controller, action, paths = '') {
        paths = paths.split('/');
        if (controller) {
            let RequestedController = this.routeMap[controller];
            if (typeof RequestedController !== 'undefined') {
                return this.dispatchController(RequestedController).then((ctr) => {
                    let promise;
                    if (action && typeof ctr[action] === 'function') {
                        promise = ctr[action].call(ctr, ...paths);
                    } else {
                        promise = ctr.exec(action, ...paths);
                    }
                    return promise
                        .then((ctrRes) =>
                            this.dispatchView(ctr, ctrRes)
                        )
                        .catch((err) =>
                            this.throwException(err)
                        );
                });
            }
        }
        this.notFoundException();
        return Promise.reject();
    }

    notFoundException() {
        this.throwException(new EXCEPTIONS.ContentNotFoundException());
    }

    dispatchController(RequestedController, ...args) {
        let ctr = new RequestedController(this, ...args);
        let destroyCtr = Promise.resolve();
        let previousCtr = internal(this).currentController;
        if (previousCtr) {
            previousCtr.off('update');
            destroyCtr = previousCtr.destroy();
        }
        return destroyCtr.then(() => {
            internal(this).currentController = ctr;
            return ctr.ready
                .then(() => Promise.resolve(ctr))
                .catch(() => Promise.reject(ctr));
        });
    }

    dispatchView(controller, controllerResponse) {
        const AppView = this.constructor.View;
        return new Promise((resolve) => {
            let view = new AppView(controller, controllerResponse);
            internal(this).currentView = view;
            internal(this).pagesDispatcher.add(view).then((page) => {
                let oldPage = this.currentPage;
                let destroyPromise = oldPage ? oldPage.destroy() : Promise.resolve();
                this.currentPage = page;
                this.debounce(() => {
                    destroyPromise.then(() => {
                        let shown = this.currentPage.show(!oldPage);
                        if (controller) {
                            if (controller.dispatchResolved) {
                                controller.dispatchResolved();
                            }
                            controller.on('update', (newCtrRes) =>
                                this.updateView(newCtrRes)
                            );
                        }
                        shown.then(() => resolve());
                    });
                });
            });
        });
    }

    updateView(controllerResponse) {
        if (internal(this).currentView) {
            return internal(this).currentView
                .update(controllerResponse);
        }
        return Promise.reject();
    }

    debounce(callback) {
        return debounce(callback);
    }

    navigate(...args) {
        return this.router.navigate(...args);
    }

    refresh() {
        return this.router.refresh();
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
        return Promise.resolve();
    }

    error() {
        // ERROR
        return Promise.resolve();
    }
}
