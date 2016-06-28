import { CallbackHelper } from './helpers/callback.js';

export class Controller {
    constructor(appInstance) {
        let Ctr = this.constructor;
        this.App = appInstance;
        this.ready = Ctr.ready;
        CallbackHelper.define(this);
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
}

Controller.ready = Promise.resolve();
