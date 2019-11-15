import { mix } from '@chialab/proteins';
import { CallbackMixin } from './mixins/callback.js';
import { BaseMixin } from './mixins/base.js';

export class Factory extends mix(class {}).with(CallbackMixin, BaseMixin) {
    factory(name) {
        let injected = this.getContext().getInjected();
        return injected && injected[name];
    }
}
