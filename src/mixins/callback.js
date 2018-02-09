import { on, off, trigger } from '@chialab/proteins/src/events.js';
import Symbolic from '@chialab/proteins/src/symbolic.js';

const LISTENERS_SYM = Symbolic('listeners');

export const CallbackMixin =
    (SuperClass) => class extends SuperClass {
        constructor(...args) {
            super(...args);
            if (!this[LISTENERS_SYM]) {
                this[LISTENERS_SYM] = [];
            }
        }

        on(name, callback) {
            return on(this, name, callback);
        }

        off(name, callback) {
            return off(this, name, callback);
        }

        trigger(name, ...args) {
            return trigger(this, name, ...args);
        }

        listen(obj, name, callback) {
            let destroyer = on(obj, name, callback);
            this[LISTENERS_SYM].push(destroyer);
            return destroyer;
        }

        unlisten(obj, name, callback) {
            if (obj) {
                off(obj, name, callback);
            } else {
                this[LISTENERS_SYM].forEach((offListener) => offListener());
                this[LISTENERS_SYM] = [];
            }
        }

        destroy() {
            this.off();
            this.unlisten();
            return super.destroy();
        }
    };
