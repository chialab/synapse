export const InjectableMixin = (superClass) => class extends superClass {
    static get inject() {
        return [];
    }

    initialize(...args) {
        super.initialize(...args);
        let inject = this.constructor.inject;
        if (Array.isArray(inject)) {
            inject.forEach((name) => this.inject(name));
        } else if (typeof inject === 'object') {
            for (let name in inject) {
                if (inject.hasOwnProperty(name)) {
                    this.inject(name, inject[name]);
                    this.inject(name);
                }
            }
        }
    }

    inject(name, Fn) {
        let owner = this;
        if (typeof this.getOwner === 'function') {
            owner = this.getOwner();
        }
        this.injected = this.injected || {};
        if (typeof Fn === 'undefined') {
            this.injected[name] = owner.factory(name);
        } else if (owner !== this) {
            owner.inject(name, Fn);
        } else {
            owner.injected[name] = new Fn(owner);
        }
    }

    factory(name) {
        return this.injected && this.injected[name];
    }
};
