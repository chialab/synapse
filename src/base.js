import { mix } from './helpers/mixin.js';
import { BaseMixin } from './mixins/base.js';
import { InjectableMixin } from './mixins/injectable.js';
import { CallbackMixin } from './mixins/callback.js';

export class BaseObject extends mix(class {}).with(
    BaseMixin,
    CallbackMixin,
    InjectableMixin
) {}
