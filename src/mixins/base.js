import { internal } from '../helpers/internal.js';
import { CallbackMixin } from './callback.js';

export const BaseMixin = (SuperClass) => class extends CallbackMixin(SuperClass) {
    constructor(...args) {
        super(...args);
        internal(this).readyPromises = [];
    }

    initialize() {
        this.initialized = true;
        return Promise.resolve();
    }

    ready() {
        return Promise.all(
            internal(this).readyPromises
        );
    }

    addReadyPromise(promise) {
        internal(this).readyPromises.push(promise);
        return promise;
    }

    destroy() {
        internal.destroy(this);
        return Promise.resolve();
    }

    setContext(ctx) {
        internal(this).ctx = ctx;
    }

    getContext() {
        return internal(this).ctx || this;
    }

    initClass(Class, ...args) {
        let obj = new Class(...args);
        obj.setContext(this.getContext());
        return obj.initialize(...args)
            .then(() => Promise.resolve(obj));
    }
};
