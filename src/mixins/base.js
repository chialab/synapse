import { internal } from '../helpers/internal.js';

export const BaseMixin = (superClass) => class extends superClass {
    constructor(...args) {
        super(...args);
        if (!this.preventInitialization) {
            this.initialize(...args);
        }
    }

    initialize() {
        internal(this).readyPromises = [];
    }

    ready() {
        return Promise.all(
            internal(this).readyPromises
        );
    }

    addReadyPromise(promise) {
        internal(this).readyPromises.push(promise);
    }

    destroy() {
        internal.destroy(this);
    }
};
