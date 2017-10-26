import { BaseComponent } from '@dnajs/idom';
import { mix } from './helpers/mixin.js';
import { ComponentMixin } from './mixins/component.js';

export class Component extends mix(BaseComponent).with(ComponentMixin) {}
