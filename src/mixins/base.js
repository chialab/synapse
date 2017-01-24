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
        let promises = internal(this).readyPromises;
        internal(this).readyPromises = [];
        return Promise.all(promises)
            .then(() => {
                if (internal(this).readyPromises.length) {
                    return this.ready();
                }
                return Promise.resolve();
            });
    }

    addReadyPromise(promise) {
        internal(this).readyPromises.push(promise);
    }

    destroy() {
        internal.destroy(this);
    }
};
