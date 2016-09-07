import { mix } from 'mixwith';
import { CallbackManager } from 'chialab/callback-manager/src/callback-manager.js';

export const CallbackMixin =
    (superClass) => class extends mix(superClass).with(CallbackManager.mixin) {
        destroy() {
            super.destroy();
            this.off();
        }
    };
