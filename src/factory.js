import { mix, EmitterMixin } from '@chialab/proteins';
import { BaseMixin } from './mixins/base.js';

export class Factory extends mix(class {}).with(EmitterMixin, BaseMixin) {
    factory(name) {
        let injected = this.getContext().getInjected();
        return injected && injected[name];
    }
}
