import { mix } from 'mixwith';
import { OwnableMixin } from './mixins/ownable.js';
import { InjectableMixin } from './mixins/injectable.js';
import { CallbackMixin } from './mixins/callback.js';

const mixins = [
    OwnableMixin,
    InjectableMixin,
    CallbackMixin,
];

export class BaseObject extends mix(class {}).with(...mixins) {
    destroy() {
        this.off();
    }
}
