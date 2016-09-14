export const BaseMixin = (superClass) => class extends superClass {
    initialize() {
        this.readyPromises = [];
    }
    ready() {
        return Promise.all(this.readyPromises);
    }
    destroy() {}
};
