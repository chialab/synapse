import { BaseComponent } from '@dnajs/idom';
import { CallbackManager } from './helpers/callback-manager.js';
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
        this.ready()
            .then(() => {
                this.isReady = true;
                if (this.requestedRender) {
                    this.render(...this.requestedRender);
                }
            });
    }

    render(...args) {
        if (!this.isReady) {
            this.requestedRender = args;
            return;
        }
        return super.render(...args);
    }
}

Component.notifications = new CallbackManager();
