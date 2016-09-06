import { mix } from 'mixwith';
import { OwnableMixin } from './ownable.js';

export const InjectableMixin = (superClass) => class extends mix(superClass).with(OwnableMixin) {
    static get inject() {
        return [];
    }

    constructor(...args) {
        super(...args);
        let inject = this.constructor.inject;
        if (Array.isArray(inject)) {
            inject.forEach((name) => this.inject(name));
        } else if (typeof inject === 'object') {
            for (let name in inject) {
                if (inject.hasOwnProperty(name)) {
                    this.inject(name, inject[name]);
                }
            }
        }
    }

    inject(name, fn) {
        this.injected = this.injected || {};
        if (typeof name === 'string') {
            if (typeof fn !== 'undefined') {
                this.injected[name] = fn;
            } else if (!this.injected[name]) {
                let obj = this.getFactory(name);
                if (obj) {
                    this.injected[name] = obj;
                }
            }
            return this.injected[name];
        }
        return null;
    }

    getFactory(name) {
        let owner = this.getOwner();
        return owner.injected && owner.injected[name];
    }
};
