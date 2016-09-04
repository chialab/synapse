export const OwnableMixin = (superClass) => class extends superClass {
    setOwner(owner) {
        this.owner = owner;
    }
    getOwner() {
        return this.owner || this;
    }
};
