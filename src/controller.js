export class Controller {
    constructor(appInstance) {
        this.App = appInstance;
        this.promise = new Promise((resolve) => {
            this._resolve = resolve;
        });
    }

    ready() {
        return this.promise;
    }

    resolve(view, vars) {
        this._resolve([view, vars]);
    }

    exec() {
        this.resolve();
    }

    redirect(path) {
        this.App.navigate(path);
    }
}
