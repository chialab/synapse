export const OwnableMixin = (superClass) => class extends superClass {
    onInit(owner, ...args) {
        if (owner) {
            if (typeof owner.getOwner === 'function') {
                owner = owner.getOwner();
            }
            this.setOwner(owner);
        }
        super.onInit(owner, ...args);
    }

    setOwner(owner) {
        this.owner = owner;
    }

    getOwner() {
        return this.owner;
    }
};
