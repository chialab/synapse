import { CallbackManager } from 'chialab-callback-manager/src/callback-manager.js';
import { BaseComponent } from '@dnajs/idom/index.observer.js';
import { mix } from './helpers/mixin.js';
import { BaseMixin } from './mixins/base.js';
import { InjectableMixin } from './mixins/injectable.js';

export class Component extends mix(BaseComponent).with(BaseMixin, InjectableMixin) {
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
