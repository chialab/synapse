import { mix } from './helpers/mixin.js';
import { BaseObject } from './base.js';
import { OwnableMixin } from './mixins/ownable.js';

export class Factory extends mix(BaseObject).with(
    OwnableMixin
) {}
