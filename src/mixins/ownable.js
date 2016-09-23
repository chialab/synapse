import { internal } from '../helpers/internal.js';

export const OwnableMixin = (superClass) => class extends superClass {
    initialize(owner, ...args) {
        if (owner) {
            if (typeof owner.getOwner === 'function') {
                owner = owner.getOwner();
            }
            this.setOwner(owner);
        }
        super.initialize(owner, ...args);
    }

    setOwner(owner) {
        internal(this).owner = owner;
    }

    getOwner() {
        return internal(this).owner;
    }
};
