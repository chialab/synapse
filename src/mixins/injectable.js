import { internal } from '../helpers/internal.js';

export const InjectableMixin = (SuperClass) => class extends SuperClass {
    constructor(...args) {
        super(...args);
        internal(this).injected = {};
    }

    initialize(config = {}) {
        return super.initialize(config)
            .then(() =>
                this.beforeInjectsInitialization(config)
                    .then((injectors) =>
                        this.injectMultiple(injectors)
                    )
                    .then(() => this.afterInjectsInitialization())
            );
    }

    getContextInjected() {
        return internal(this.getContext()).injected;
    }

    getInjected() {
        return internal(this).injected;
    }

    beforeInjectsInitialization(config) {
        let fromCfg = config.injectors || {};
        let fromCtr = this.constructor.injectors || {};
        return Promise.resolve([fromCfg, fromCtr]);
    }

    afterInjectsInitialization() {
        return Promise.resolve();
    }

    onInjectReady(inject, fn) {
        internal(this).injected[inject] = fn;
        return Promise.resolve();
    }

    injectMultiple(injectors) {
        let promise = Promise.resolve();
        if (Array.isArray(injectors)) {
            injectors.forEach((injs) => {
                promise = promise.then(() => this.injectMultiple(injs));
            });
        } else {
            for (let name in injectors) {
                promise = promise.then(() => this.inject(name, injectors[name]));
            }
        }
        return promise;
    }

    inject(inject, Fn) {
        let injs = this.getContextInjected();
        if (injs.hasOwnProperty(inject)) {
            return Promise.resolve(injs[inject]);
        }
        let args = [];
        if (Array.isArray(Fn)) {
            args = Fn.slice(1);
            Fn = Fn[0];
        }
        let resolve = Promise.resolve(Fn);
        if (typeof Fn === 'function') {
            resolve = this.initClass(Fn, ...args);
        }
        return resolve.then((fn) => {
            injs[inject] = fn;
            return fn.ready()
                .then(() => this.onInjectReady(inject, fn));
        });
    }
};
