import { mix } from './helpers/mixin.js';
import { ComponentMixin } from './mixins/component.js';
import { COMPONENT_SYMBOL, BaseComponent } from '@dnajs/idom';
import { RENDER_SYMBOL } from './factories/render.js';

export class Component extends mix(BaseComponent).with(ComponentMixin) {
    constructor() {
        super();
        if (self[RENDER_SYMBOL]) {
            this.setOwner(self[RENDER_SYMBOL]);
            this.initialize();
        }
    }
}
