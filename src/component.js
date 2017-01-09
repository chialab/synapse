import { CallbackManager } from 'chialab-callback-manager/src/callback-manager.js';
import { BaseComponent } from '@dnajs/idom';
import { mix } from './helpers/mixin.js';
import { internal } from './helpers/internal.js';
import { BaseMixin } from './mixins/base.js';
import { OwnableMixin } from './mixins/ownable.js';
import { InjectableMixin } from './mixins/injectable.js';

export class Component extends mix(BaseComponent).with(BaseMixin, OwnableMixin, InjectableMixin) {
    constructor(...args) {
        super(...args);
        internal(this).created = true;
        Component.notifications.trigger('created', this);
    }

    initialize(scope, ...args) {
        if (internal(this).created) {
            super.initialize(scope, ...args);
        }
    }
}

Component.notifications = new CallbackManager();
