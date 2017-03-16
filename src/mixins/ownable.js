import { internal } from '../helpers/internal.js';
import { BaseObject } from '../base.js';

export const OwnableMixin = (superClass) => class extends superClass {
    constructor(owner, ...args) {
        if (owner && owner instanceof BaseObject) {
            if (typeof owner.getOwner === 'function') {
                owner = owner.getOwner();
            }
            super(...args);
            this.setOwner(owner);
        } else {
            super(owner, ...args);
        }
    }

    setOwner(owner) {
        internal(this).owner = owner;
    }

    getOwner() {
        return internal(this).owner;
    }

    initClass(Class, ...args) {
        return new Class(this.getOwner(), ...args);
    }
};
