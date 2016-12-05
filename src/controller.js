import { internal } from './helpers/internal.js';
import { Factory } from './factory.js';
import { IDOM } from '@dnajs/idom';

export class Controller extends Factory {
    constructor(appInstance) {
        super(appInstance);
        let Ctr = this.constructor;
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
            this.stream(vars);
        }).then(() => {
            delete this.dispatchResolved;
            return Promise.resolve();
        });
    }

    render(res) {
        return () =>
            IDOM.h('div', null, res);
    }

    stream(vars) {
        let previous = internal(this).streams || {};
        for (let k in previous) {
            if (!vars.hasOwnProperty(k)) {
                vars[k] = previous[k];
            }
        }
        internal(this).streams = vars;
        this.trigger('stream', vars);
    }

    pipe(callback) {
        this.on('stream', (vars) => callback(vars));
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
