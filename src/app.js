import '@dnajs/idom/observer.js';
import { Router } from 'chialab-router/src/router.js';
import { PageViewComponent } from './components/page.js';
import { internal } from './helpers/internal.js';
import { BaseObject } from './base.js';
import { Controller } from './controller.js';
import { I18NHelper } from './helpers/i18n.js';
import { CssHelper } from './helpers/css.js';
import { debounce } from './helpers/debounce.js';
import { Component } from './component.js';
import * as EXCEPTIONS from './exceptions.js';
import { IDOM, DOM } from '@dnajs/idom';

export class App extends BaseObject {
    static get View() {
        return PageViewComponent;
    }

    static get I18NHelper() {
        return I18NHelper;
    }

    static addStyle(css) {
        return CssHelper.add(css);
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
        this.element = element;
        this.router = new Router(this.routeOptions);
        this.registerRoutes();
        this.i18n = new this.constructor.I18NHelper(this.i18nOptions);
        this.handleNavigation();
        this.handleComponents();
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

    handleNavigation() {
        this.element.addEventListener('click', (ev) => {
            let elem = ev.target;
            while (elem && elem.tagName !== 'A') {
                elem = elem.parentNode;
            }
            if (elem && elem.tagName === 'A') {
                return this.handleLink(ev, elem, this);
            }
            return true;
        });
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

    handleComponents() {
        let lastComponent;
        Component.notifications.on('created', (elem) => {
            if (elem instanceof Component) {
                let scope = internal(this).rendering ? this :
                    (lastComponent && lastComponent.getOwner());
                if (scope === this) {
                    elem.setOwner(scope);
                    elem.initialize();
                }
                lastComponent = elem;
            }
        });
    }

    dispatchController(RequestedController, ...args) {
        let ctr = new RequestedController(this, ...args);
        let destroyCtr = Promise.resolve();
        let previousCtr = internal(this).currentController;
        if (previousCtr) {
            destroyCtr = previousCtr.destroy();
        }
        return destroyCtr.then(() => {
            internal(this).currentController = ctr;
            return ctr.ready()
                .then(() => Promise.resolve(ctr))
                .catch(() => Promise.reject(ctr));
        });
    }

    dispatchView(controller, response) {
        return new Promise((resolve) => {
            let oldPage = this.currentPage;
            let destroyPromise = oldPage ? oldPage.destroy() : Promise.resolve();
            destroyPromise.then(() => {
                let page = new this.constructor.View(this);
                page.setOwner(this);
                this.currentPage = page;
                DOM.appendChild(this.element, page);
                if (controller) {
                    controller.pipe((updatedResponse) => {
                        internal(this).rendering = true;
                        IDOM.patch(page.node, controller.render(updatedResponse));
                        internal(this).rendering = false;
                    });
                    internal(this).rendering = true;
                    IDOM.patch(page.node, controller.render(response));
                    internal(this).rendering = false;
                }
                let shown = this.currentPage.show(!oldPage);
                if (controller) {
                    if (controller.dispatchResolved) {
                        controller.dispatchResolved();
                    }
                }
                shown.then(() => {
                    if (oldPage) {
                        DOM.removeChild(this.element, oldPage);
                    }
                    resolve();
                });
            });
        });
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
