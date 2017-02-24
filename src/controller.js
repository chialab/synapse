import { internal } from './helpers/internal.js';
import { Factory } from './factory.js';
import { IDOM } from '@dnajs/idom';

export class Controller extends Factory {
    render(res) {
        return () =>
            IDOM.h('div', null, res);
    }

    stream(vars = {}) {
        let previous = internal(this).streams || {};
        for (let k in previous) {
            if (!vars.hasOwnProperty(k)) {
                vars[k] = previous[k];
            }
        }
        internal(this).streams = vars;
        return this.trigger('stream', vars);
    }

    pipe(callback) {
        this.on('stream', (vars) => callback(vars));
    }

    exec() {
        return this.stream({});
    }

    redirect(path) {
        return this.getOwner().navigate(path);
    }

    next() {
        return Promise.reject();
    }
}
