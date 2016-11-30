import { mix } from './helpers/mixin.js';
import { ComponentMixin } from './mixins/component.js';
import { COMPONENT_SYMBOL, BaseComponent } from '@dnajs/idom';

export class Component extends mix(BaseComponent).with(ComponentMixin) {
    connectedCallback() {
        if (!super.getOwner()) {
            let parent = this.getParentView();
            if (parent) {
                this.initialize(parent);
            }
        }
        super.connectedCallback();
    }

    getOwner() {
        let res = super.getOwner();
        if (res) {
            return res;
        }
        return this.getParentView();
    }

    getParentView() {
        let parent = this.node.parentNode;
        while (parent) {
            let component = parent[COMPONENT_SYMBOL];
            if (component && typeof component.getOwner === 'function') {
                return component.getOwner();
            }
            parent = parent.parentNode;
        }
        return null;
    }
}
