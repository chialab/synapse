import { Router } from 'chialab/router/src/router.js';
import { Controller } from '../controller.js';

export const RoutableMixin = (superClass) => class extends superClass {
    static get defaultRouteOptions() {
        return {};
    }

    static get routeOptions() {
        return this.defaultRouteOptions;
    }

    static get routeRules() {
        return {};
    }

    static get routeMap() {
        return {};
    }

    initialize(...args) {
        const Ctr = this.constructor;
        this.router = new Router(Ctr.routeOptions);
        this.registerRoutes(Ctr.routeRules);
        this.registerRouteMap(Ctr.routeMap);
        super.initialize(...args);
    }

    registerRoutes(routeRules) {
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

    registerRouteMap(routeMap) {
        for (let k in routeMap) {
            if (routeMap.hasOwnProperty(k)) {
                this.routeMap = this.routeMap || {};
                this.routeMap[k] = routeMap[k];
            }
        }
    }

    backState() {
        return this.router.back();
    }

    forwardState() {
        return this.router.forward();
    }
};
