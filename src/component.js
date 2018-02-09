import { BaseComponent } from '@dnajs/idom';
import { mix } from '@chialab/proteins/src/mixin.js';
import { ComponentMixin } from './mixins/component.js';

export class Component extends mix(BaseComponent).with(ComponentMixin) {}
