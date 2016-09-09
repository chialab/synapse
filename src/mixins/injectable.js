export const InjectableMixin = (superClass) => class extends superClass {
    static get inject() {
        return [];
    }

    initialize(...args) {
        super.initialize(...args);
        if (this.constructor.injectors) {
            this.registerInject(this.constructor.injectors);
        }
        if (this.constructor.inject) {
            this.inject(this.constructor.inject);
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
            owner.injected = owner.injected || {};
            owner.injected[inject] = new Fn(owner);
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
            this.injected = this.injected || {};
            this.injected[inject] = owner.factory(inject);
        }
    }

    factory(name) {
        return this.injected && this.injected[name];
    }
};
