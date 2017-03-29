import { mix } from './helpers/mixin.js';
import { Factory } from './factory.js';
import { InjectableMixin } from './mixins/injectable.js';

export class Plugin extends mix(Factory).with(InjectableMixin) {
    static supported() {
        return Promise.resolve();
    }

    static get dependencies() {
        return [];
    }
}
