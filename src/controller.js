import { mix } from '@chialab/proteins';
import { IDOM } from '@dnajs/idom';
import { internal } from './helpers/internal.js';
import { Factory } from './factory.js';
import { ControllerMixin } from './mixins/controller.js';

export class Controller extends mix(Factory).with(ControllerMixin) {
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
            if (!Object.prototype.hasOwnProperty.call(vars, k)) {
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
}
