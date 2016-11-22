import { mix } from './helpers/mixin.js';
import { ComponentMixin } from './mixins/component.js';
import { BaseComponent } from '@dnajs/idom';

export class Component extends mix(BaseComponent).with(ComponentMixin) {
    connectedCallback() {
        if (!this.getOwner()) {
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
        let parent = this.parentNode;
        while (parent) {
            if (typeof parent.getOwner === 'function') {
                return parent.getOwner();
            }
            parent = parent.parentNode;
        }
        return null;
    }
}
