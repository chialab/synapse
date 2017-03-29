import { mix } from '../helpers/mixin.js';
import { internal } from '../helpers/internal.js';
import { CallbackManager } from 'chialab-callback-manager/src/callback-manager.js';

export const CallbackMixin =
    (SuperClass) => class extends mix(SuperClass).with(CallbackManager.mixin) {
        constructor(...args) {
            super(...args);
            internal(this).listeners = [];
        }

        listen(scope, ev, callback) {
            internal(this).listeners.push(
                scope.on(ev, callback)
            );
        }

        unlisten() {
            if (internal(this).listeners) {
                internal(this).listeners.forEach((destroy) => destroy());
                internal(this).listeners = [];
            }
        }

        destroy() {
            this.unlisten();
            this.off();
            return super.destroy();
        }
    };
