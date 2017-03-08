import { internal } from './helpers/internal.js';
import { Factory } from './factory.js';
import { IDOM } from '@dnajs/idom/index.observer.js';

export class Controller extends Factory {
    render() {
        let res = internal(this).streams;
        return () =>
            IDOM.h('div', null, res);
    }

    getResponse() {
        return internal(this).streams;
    }

    setResponse(res) {
        internal(this).streams = res;
    }

    stream(vars = {}) {
        let previous = this.getResponse() || {};
        for (let k in previous) {
            if (!vars.hasOwnProperty(k)) {
                vars[k] = previous[k];
            }
        }
        this.setResponse(vars);
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
