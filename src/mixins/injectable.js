import { internal } from '../helpers/internal.js';

export const InjectableMixin = (superClass) => class extends superClass {
    static get inject() {
        return [];
    }

    initialize(...args) {
        super.initialize(...args);
        let Super = this.constructor;
        while (Super) {
            if (Super.injectors) {
                this.registerInject(Super.injectors);
            }
            if (Super.inject) {
                this.inject(Super.inject);
            }
            Super = Object.getPrototypeOf(Super);
        }
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
            internal(owner).injected[inject] = new Fn(owner);
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
                internal(this).injected[inject] = owner.factory(inject);
            }
        }
    }

    factory(name) {
        return internal(this).injected && internal(this).injected[name];
    }
};
