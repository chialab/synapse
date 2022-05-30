import { mix } from './helpers/mixin.js';
import { Router } from './router/router.js';
import { PageViewComponent } from './components/page.js';
import { internal } from './helpers/internal.js';
import { BaseObject } from './base.js';
import { PluggableMixin } from './mixins/pluggable.js';
import { Controller } from './controller.js';
import { I18NHelper } from './helpers/i18n.js';
import { UrlHelper } from './helpers/url.js';
import { Component } from './component.js';
import * as EXCEPTIONS from './exceptions.js';
import { bootstrap, IDOM, DOM } from '@dnajs/idom';

export class App extends mix(BaseObject).with(PluggableMixin) {
    /**
     * The component to use as page view.
     * @type {Component}
     */
    static get View() {
        return PageViewComponent;
    }
    /**
     * The constructor to use for app navigation.
     * It should replicate the same interface of chialab-router.
     * @type {class}
     */
    static get Router() {
        return Router;
    }
    /**
     * The constructor to use for app localization.
     * It should replicate the same interface of chialab-i18n.
     * @type {class}
     */
    static get I18N() {
        return I18NHelper;
    }
    /**
     * Default router options.
     * @see chialab-router options.
     * @type {Object}
     */
    get routeOptions() {
        return {
            dispatch: true,
        };
    }

    get routeRules() {
        return {};
    }
    /**
     * Default localization options.
     * @see chialab-i18n options.
     * @type {Object}
     */
    get i18nOptions() {
        return {
            languages: [],
        };
    }
    /**
     * Set up the application.
     *
     * @param {Element} element The element to use for application root.
     * @return {Promise} The initialization promise.
     */
    initialize(element) {
        this.element = element;
        this.router = new this.constructor.Router(this.routeOptions);
        this.i18n = new this.constructor.I18N(this.i18nOptions);
        return Promise.all([
            this.handleComponents(),
            this.handleNavigation(),
            super.initialize(element),
        ]).then(() => {
            this.registerRoutes();
            this.ready()
                .then(() =>
                    this.start()
                )
                .catch((ex) => {
                    this.onInitializeError(ex);
                });
            return Promise.resolve();
        });
    }
    onInitializeError(ex) {
        // eslint-disable-next-line
        console.error(ex);
        // eslint-disable-next-line
        alert('Error occurred on application initialize.');
    }
    /**
     * Callback for plugins ready.
     * Handle plugins' routes and locales.
     *
     * @param {Plugin} plugin The plugin instance.
     */
    onPluginReady(plugin) {
        if (plugin.routeRules) {
            this.registerRoutes(plugin.routeRules);
        }
        let Super = this.constructor;
        let ctrs = [];
        while (Super) {
            if (Super.locales && ctrs.indexOf(Super.locales) === -1) {
                ctrs.unshift(Super.locales);
            }
            Super = Object.getPrototypeOf(Super);
        }
        ctrs.forEach((locales) => {
            this.registerLocales(locales);
        });
    }
    /**
     * Start up the app.
     * Start the routing navigation.
     *
     * @return {Promise} The start up promise.
     */
    start() {
        this.router.on('*', () => {
            this.notFound();
        });
        return this.router.start();
    }
    /**
     * Add resources to localization helper.
     *
     * @param {Object} locales A list of localization rules.
     */
    registerLocales(locales) {
        for (let k in locales) {
            this.i18n.addResources(locales[k], k);
        }
    }

    registerRoutes(routeRules) {
        const callbacks = this.router.callbacks;
        routeRules = routeRules || this.routeRules;
        for (let k in routeRules) {
            if (routeRules.hasOwnProperty(k) && !callbacks.hasOwnProperty(k)) {
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
                } else {
                    let action;
                    if (Array.isArray(ruleMatch)) {
                        action = ruleMatch[1];
                        ruleMatch = ruleMatch[0];
                    }
                    if (ruleMatch.prototype instanceof Controller) {
                        this.router.on(k, (...args) =>
                            this.beforeRoute(...args).then(() =>
                                this.dispatchController(ruleMatch)
                                    .then((ctr) => {
                                        let promise = ctr.ready();
                                        if (action && typeof ctr[action] === 'function') {
                                            promise = promise.then(() => ctr[action].call(ctr, ...args));
                                        } else {
                                            promise = promise.then(() => ctr.exec(...args));
                                        }
                                        return promise
                                            .then(() => this.dispatchView(ctr));
                                    })
                                    .then(() => this.afterRoute(...args))
                                    .catch((err) => {
                                        try {
                                            if (!this.throwException(err)) {
                                                return Promise.reject(err);
                                            }
                                        } catch (ex) {
                                            return Promise.reject(ex);
                                        }
                                        return Promise.resolve();
                                    })
                            )
                        );
                    }
                }
            }
        }
    }

    beforeRoute(...args) {
        return Promise.resolve(args);
    }

    afterRoute(...args) {
        return Promise.resolve(args);
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
        return Promise.resolve();
    }

    handleLink(ev, ...args) {
        const plugins = this.getPluginInstances();
        for (let i = 0, len = plugins.length; i < len; i++) {
            let plugin = plugins[i];
            if (typeof plugin.handleLink === 'function') {
                if (!plugin.handleLink(ev, ...args)) {
                    return false;
                }
            }
        }
        let node = ev.target;
        let link = node.tagName === 'A' ? node : node.closest('a');
        if (link) {
            let href = link.getAttribute('href');
            let target = link.getAttribute('target');
            if (href && (!target || target === '_self') && !UrlHelper.isAbsoluteUrl(href)) {
                ev.preventDefault();
                ev.stopPropagation();
                this.navigate(href);
            }
        }
        return true;
    }

    handleComponents() {
        let lastComponent;
        Component.notifications.on('created', (elem) => {
            if (elem instanceof Component) {
                let scope = this._isRendering() ? this :
                    (lastComponent && lastComponent.getOwner());
                if (scope === this) {
                    elem.setOwner(scope);
                    this._addRendering(
                        elem.initialize()
                    );
                }
                lastComponent = elem;
            }
        });
        this._setRendering();
        bootstrap(this.element);
        this._unsetRendering();
        return this._rendered();
    }

    dispatchController(RequestedController, ...args) {
        let lastControllerRequest = internal(this).lastControllerRequest
            || Promise.resolve();
        let ctr = new RequestedController(this, ...args);
        let destroyCtr = Promise.resolve();
        let previousCtr = internal(this).currentController;
        if (previousCtr) {
            destroyCtr = previousCtr.destroy();
        }
        lastControllerRequest = lastControllerRequest.then(() =>
            destroyCtr.then(() => {
                internal(this).currentController = ctr;
                return ctr.ready()
                    .then(() => Promise.resolve(ctr))
                    .catch(() => Promise.reject(ctr));
            })
        );
        internal(this).lastControllerRequest = lastControllerRequest;
        return lastControllerRequest;
    }

    dispatchView(controller) {
        return new Promise((resolve) => {
            let oldPage = this.currentPage;
            let destroyPromise = oldPage ? oldPage.destroy() : Promise.resolve();
            destroyPromise.then(() => {
                let page = new this.constructor.View();
                page.setOwner(this);
                this.currentPage = page;
                DOM.appendChild(this.element, page);
                let renderPromise = Promise.resolve();
                if (controller) {
                    controller.pipe((updatedResponse) => {
                        this.render(controller.render(updatedResponse));
                    });
                    renderPromise = this.render(controller.render(controller.getResponse()));
                }
                let shown = Promise.all([
                    renderPromise,
                    this.currentPage.show(!oldPage),
                ]);
                shown.then(() => {
                    if (oldPage) {
                        DOM.removeChild(this.element, oldPage);
                    }
                    resolve();
                });
            });
        });
    }

    render(renderFn) {
        this._setRendering();
        IDOM.patch(this.currentPage.node, renderFn);
        this._unsetRendering();
        return this._rendered();
    }

    navigate(...args) {
        return this.router.navigate(...args);
    }

    refresh() {
        return this.router.refresh();
    }

    throwException(err) {
        if (err && err instanceof EXCEPTIONS.AppException) {
            if (!this.handleException(err)) {
                throw err;
            }
            return true;
        }
        return false;
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
    /**
     * Set the application in rendering mode.
     * @private
     */
    _setRendering() {
        internal(this).rendering = true;
        internal(this).renderingPromises = [];
    }
    /**
     * Unset the application from rendering mode.
     * @private
     */
    _unsetRendering() {
        internal(this).rendering = false;
    }
    /**
     * Add a rendering promise.
     * @private
     *
     * @param {Promise} rendering The promise to add to rendering queue.
     */
    _addRendering(rendering) {
        internal(this).renderingPromises.push(rendering);
    }
    /**
     * Check if app is in rendering mode.
     * @private
     *
     * @return {Boolean}
     */
    _isRendering() {
        return !!internal(this).rendering;
    }
    /**
     * Return the rendering resolution queue.
     * @private
     *
     * @return {Promise} Resolves when all rendering promieses are resolved.
     */
    _rendered() {
        return Promise.all(internal(this).renderingPromises);
    }
}
