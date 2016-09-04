import { BaseObject } from './base.js';

export class Controller extends BaseObject {
    constructor(appInstance) {
        super();
        let Ctr = this.constructor;
        this.setOwner(appInstance);
        this.ready = Ctr.ready;
    }

    promise(callback) {
        return new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
            callback();
        });
    }

    resolve(vars = {}) {
        return new Promise((resolve) => {
            this.dispatchResolved = resolve;
            this._resolve(vars);
        }).then(() => {
            delete this.dispatchResolved;
            return Promise.resolve();
        });
    }

    update(vars = {}) {
        return this.trigger('update', vars);
    }

    fail(err) {
        this._reject(err);
    }

    exec() {
        return this.promise(() => {
            this.resolve();
        });
    }

    redirect(path) {
        this.getOwner().navigate(path);
    }

    destroy(...args) {
        super.destroy(...args);
        return Promise.resolve();
    }
}

Controller.ready = Promise.resolve();
