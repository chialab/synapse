import { internal } from '../helpers/internal.js';

export const BaseMixin = (superClass) => class extends superClass {
    constructor(...args) {
        super(...args);
        internal(this).readyPromises = [];
        if (!this.preventInitialization) {
            this.addReadyPromise(this.initialize(...args));
        }
    }

    initialize() {
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
};
