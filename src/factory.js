import { mix } from 'mixwith';
import { BaseObject } from './base.js';
import { OwnableMixin } from './mixins/ownable.js';

export class Factory extends mix(BaseObject).with(
    OwnableMixin
) {}
