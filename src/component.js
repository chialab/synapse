import { mix } from './helpers/mixin.js';
import { BaseMixin } from './mixins/base.js';
import { OwnableMixin } from './mixins/ownable.js';
import { InjectableMixin } from './mixins/injectable.js';
import { BaseComponent } from '@dnajs/idom';

export class Component extends mix(BaseComponent).with(BaseMixin, OwnableMixin, InjectableMixin) {}
