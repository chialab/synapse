import { Router } from 'chialab/router/src/router.js';

export const RoutableMixin = (superClass) => class extends superClass {
    get defaultRouteOptions() {
        return {};
    }

    get routeOptions() {
        return this.defaultRouteOptions;
    }

    get routeRules() {
        return {};
    }

    constructor() {
        super();
        this.router = new Router(this.routeOptions);
        for (let k in this.routeRules) {
            if (this.routeRules.hasOwnProperty(k)) {
                if (typeof this[this.routeRules[k]] === 'function') {
                    this.router.on(k, this[this.routeRules[k]].bind(this));
                }
            }
        }
    }
};
