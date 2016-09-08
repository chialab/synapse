import { mix } from 'mixwith';
import { BaseObject } from './base.js';
import { RoutableMixin } from './mixins/routable.js';
import { View } from './view.js';
import { PagesHelper } from './helpers/pages.js';
import { ViewHelper } from './helpers/view.js';
import { I18NHelper } from './helpers/i18n.js';
import { CssHelper } from './helpers/css.js';
import * as EXCEPTIONS from './exceptions.js';

export class App extends mix(BaseObject).with(RoutableMixin) {
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

    static addStyle(css) {
        CssHelper.add(css);
    }

    static get defaultRouteOptions() {
        return {
            dispatch: true,
        };
    }

    static get routeOptions() {
        return this.defaultRouteOptions;
    }

    static get routeRules() {
        return {
            '/:controller/:action/*': 'route',
            '/:controller/:action': 'route',
            '/:controller': 'route',
            '*': 'notFoundException',
        };
    }

    static get routeMap() {
        return {};
    }

    initialize(element) {
        super.initialize(element);
        this.element = element;
        this.i18n = new this.constructor.I18NHelper(this.i18nOptions);
        this.pagesDispatcher = new this.constructor.PagesHelper(this.element);
        Promise.all(this.readyPromises)
            .then(() => {
                this.debounce(() => {
                    this.router.start();
                });
            })
            .catch((ex) => {
                console.error(ex);
                // eslint-disable-next-line
                alert('Error occurred on application initialize.');
            });
    }

    get i18nOptions() {
        return {
            languages: [],
        };
    }

    ready() {
        return Promise.all(this.readyPromises);
    }

    route(controller, action, paths = '') {
        paths = paths.split('/');
        if (controller) {
            let Controller = this.routeMap[controller];
            if (typeof Controller !== 'undefined') {
                return this.dispatchController(Controller).then((ctr) => {
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
                });
            }
        }
        this.notFoundException();
        return Promise.reject();
    }

    notFoundException() {
        this.throwException(new EXCEPTIONS.ContentNotFoundException());
    }

    dispatchController(Controller, ...args) {
        let ctr = new Controller(this, ...args);
        let destroyCtr = Promise.resolve();
        let previousCtr = this.currentController;
        if (previousCtr) {
            previousCtr.off('update');
            destroyCtr = previousCtr.destroy();
        }
        return destroyCtr.then(() => {
            this.currentController = ctr;
            return ctr.ready
                .then(() => Promise.resolve(ctr))
                .catch(() => Promise.reject(ctr));
        });
    }

    dispatchView(controller, controllerResponse) {
        const AppView = this.constructor.View;
        return new Promise((resolve) => {
            let view = new AppView(controller, controllerResponse);
            this.currentView = view;
            this.pagesDispatcher.add(view, false).then((page) => {
                let oldPage = this.currentPage;
                let destroyPromise = oldPage ? oldPage.destroy() : Promise.resolve();
                this.currentPage = page;
                this.debounce(() => {
                    destroyPromise.then(() => {
                        this.currentPage.show(!oldPage);
                        if (controller) {
                            if (controller.dispatchResolved) {
                                controller.dispatchResolved();
                            }
                            controller.on('update', (newCtrRes) =>
                                this.updateView(newCtrRes)
                            );
                        }
                        resolve();
                    });
                });
            });
        });
    }

    updateView(controllerResponse) {
        if (this.currentView) {
            return this.currentView.update(controllerResponse);
        }
        return Promise.reject();
    }

    debounce(callback) {
        setTimeout(() => {
            callback();
        }, 0);
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
