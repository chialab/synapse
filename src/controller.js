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
        this._resolve([view, vars]);
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
