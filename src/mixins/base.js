import { internal } from '../helpers/internal.js';

export const BaseMixin = (SuperClass) => class extends SuperClass {
    constructor(...args) {
        super(...args);
        internal(this).readyPromises = [];
    }

    initialize() {
        internal(this).initialized = true;
        return Promise.resolve();
    }

    initialized() {
        return !!internal(this).initialized;
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

    isDestroyed() {
        return this.destroyed;
    }

    destroy() {
        return super.destroy()
            .then(() => {
                internal.destroy(this);
                this.destroyed = true;
                return Promise.resolve();
            });
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
        if (!obj.initializing() && !obj.initialized()) {
            obj.addReadyPromise(obj.initialize(...args));
        }
        return obj.ready().then(() => Promise.resolve(obj));
    }
};
