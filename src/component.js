import { CallbackManager } from 'chialab-callback-manager/src/callback-manager.js';
import { BaseComponent } from '@dnajs/idom';
import { mix } from './helpers/mixin.js';
import { BaseMixin } from './mixins/base.js';
import { OwnableMixin } from './mixins/ownable.js';
import { InjectableMixin } from './mixins/injectable.js';

export class Component extends mix(BaseComponent).with(BaseMixin, OwnableMixin, InjectableMixin) {
    get preventInitialization() {
        return true;
    }

    constructor(...args) {
        super(...args);
        Component.notifications.trigger('created', this);
    }
}

Component.notifications = new CallbackManager();
