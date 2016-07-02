import { CallbackManager } from 'chialab/callback-manager/src/callback-manager.js';

export class Controller {
    constructor(appInstance) {
        let Ctr = this.constructor;
        this.App = appInstance;
        this.ready = Ctr.ready;
        CallbackManager.define(this);
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
        this.trigger('update', vars);
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
        this.App.navigate(path);
    }

    destroy() {
        return Promise.resolve();
    }
}

Controller.ready = Promise.resolve();
