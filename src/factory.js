import mix from '@chialab/proteins/src/mixin.js';
import { EmitterMixin } from '@chialab/proteins/src/factory.js';
import { BaseMixin } from './mixins/base.js';

export class Factory extends mix(class {}).with(EmitterMixin, BaseMixin) {
    factory(name) {
        let injected = this.getContext().getInjected();
        return injected && injected[name];
    }
}
