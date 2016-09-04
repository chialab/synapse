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
                    this.injected = this.injected || {};
                    this.injected[name] = inject[name];
                }
            }
        }
    }

    inject(name) {
        let owner = this.getOwner();
        if (typeof name === 'string') {
            let obj = owner.getFactory(name);
            if (obj) {
                this.injected = this.injected || {};
                this.injected[name] = obj;
            }
        }
    }

    getFactory(name) {
        return this.injected && this.injected[name];
    }
};
