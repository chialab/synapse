import { mix } from 'mixwith';
import { BaseMixin } from './mixins/base.js';
import { OwnableMixin } from './mixins/ownable.js';
import { InjectableMixin } from './mixins/injectable.js';
import { CallbackMixin } from './mixins/callback.js';

export class BaseObject extends mix(class {
    constructor(...args) {
        this.readyPromises = [];
        this.initialize(...args);
    }
}).with(
    BaseMixin,
    CallbackMixin,
    InjectableMixin
) {}

export class AppObject extends mix(BaseObject).with(
    OwnableMixin
) {}
