import { internal } from '../helpers/internal.js';
import { CallbackMixin } from './callback.js';

export const BaseMixin = (SuperClass) => class extends CallbackMixin(SuperClass) {
    constructor(...args) {
        super(...args);
        internal(this).readyPromises = [];
    }

    initialize() {
        return Promise.resolve();
    }

    initializing() {
        let promises = internal(this).readyPromises;
        if (promises) {
            return !!promises.length;
        }
        return false;
    }

    ready() {
        let promises = internal(this).readyPromises;
        if (!promises) {
            return Promise.resolve();
        }
        return Promise.all(promises).then(() =>
            Promise.all(promises).then((res) => {
                internal(this).readyPromises = null;
                return Promise.resolve(res);
            })
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
        if (!obj.initializing()) {
            obj.addReadyPromise(obj.initialize(...args));
        }
        return obj.ready().then(() => Promise.resolve(obj));
    }
};
