import { internal } from '../helpers/internal.js';

export const InjectableMixin = (superClass) => class extends superClass {
    initialize(...args) {
        return super.initialize(...args)
            .then(() => {
                let Super = this.constructor;
                let promise = Promise.resolve();
                while (Super) {
                    let injectors = Super.injectors;
                    if (injectors) {
                        for (let name in injectors) {
                            promise = promise.then(() => this.inject(name, injectors[name]));
                        }
                    }
                    Super = Object.getPrototypeOf(Super);
                }
                return promise;
            });
    }

    inject(inject, Fn) {
        let ctx = this.getContext();
        let injs = internal(ctx).injected = internal(ctx).injected || {};
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
            ctx.trigger('injected', inject, fn);
            return fn.ready();
        });
    }

    factory(name) {
        let ctx = this.getContext();
        return internal(ctx).injected && internal(ctx).injected[name];
    }
};
