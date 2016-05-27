import { CallbackManager } from 'chialab/callback-manager/src/callback-manager.js';

const manager = new CallbackManager();

export class Controller {
    constructor(appInstance) {
        let Ctr = this.constructor;
        this.App = appInstance;
        this.ready = Ctr.ready;
    }

    promise(callback) {
        return new Promise((resolve) => {
            this._resolve = resolve;
            callback();
        });
    }

    resolve(view, vars) {
        return new Promise((resolve) => {
            this.dispatchResolved = resolve;
            this._resolve([view, vars]);
        }).then(() => {
            delete this.dispatchResolved;
            return Promise.resolve();
        });
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

manager.attachToPrototype(Controller.prototype);
