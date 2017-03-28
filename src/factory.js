import { mix } from './helpers/mixin.js';
import { BaseMixin } from './mixins/base.js';
import { InjectableMixin } from './mixins/injectable.js';

export class Factory extends mix(class {}).with(
    BaseMixin,
    InjectableMixin
) {}
