import { mix } from './helpers/mixin.js';
import { BaseMixin } from './mixins/base.js';

export class Factory extends mix(class {}).with(BaseMixin) {
    factory(name) {
        let injected = this.getContext().getInjected();
        return injected && injected[name];
    }
}
