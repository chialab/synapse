import { internal } from '../helpers/internal.js';

export const InjectableMixin = (superClass) => class extends superClass {
    static get inject() {
        return [];
    }

    initialize(...args) {
        return super.initialize(...args)
            .then(() => {
                let Super = this.constructor;
                internal(this).injectPromises = [];
                while (Super) {
                    if (Super.injectors) {
                        this.registerInject(Super.injectors);
                    }
                    if (Super.inject) {
                        this.inject(Super.inject);
                    }
                    Super = Object.getPrototypeOf(Super);
                }
                return Promise.all(internal(this).injectPromises);
            });
    }

    registerInject(inject, Fn) {
        if (Array.isArray(inject)) {
            inject.forEach((name) => this.registerInject(name));
        } else if (typeof inject === 'object') {
            for (let name in inject) {
                if (inject.hasOwnProperty(name)) {
                    this.registerInject(name, inject[name]);
                }
            }
        } else {
            let owner = this;
            if (typeof this.getOwner === 'function') {
                owner = this.getOwner();
            }
            internal(owner).injected = internal(owner).injected || {};
            if (!internal(owner).injected.hasOwnProperty(inject)) {
                let fn = internal(owner).injected[inject] = new Fn(owner);
                owner.trigger('injected', inject, fn);
                owner.addReadyPromise(fn.ready());
            }
        }
    }

    inject(inject) {
        if (Array.isArray(inject)) {
            inject.forEach((name) => this.inject(name));
        } else if (typeof inject === 'object') {
            for (let name in inject) {
                if (inject.hasOwnProperty(name)) {
                    this.inject(name);
                }
            }
        } else {
            let owner = this;
            if (typeof this.getOwner === 'function') {
                owner = this.getOwner();
            }
            if (owner) {
                internal(this).injected = internal(this).injected || {};
                let factory = owner.factory(inject);
                if (factory) {
                    internal(this).injected[inject] = factory;
                } else {
                    internal(this).injectPromises.push(
                        new Promise((resolve) => {
                            let clb = owner.on('injected', (name, injFactory) => {
                                if (name === inject) {
                                    internal(this).injected[inject] = injFactory;
                                    clb();
                                    resolve();
                                }
                            });
                        })
                    );
                }
            }
        }
    }

    factory(name) {
        return internal(this).injected && internal(this).injected[name];
    }
};
