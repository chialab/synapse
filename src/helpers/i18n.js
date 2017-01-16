import { I18N } from 'chialab-i18n/src/i18n.js';
import { internal } from './internal.js';

export class I18NHelper {
    constructor(options = {}) {
        internal(this).i18n = new I18N(options);
    }

    addResources(...args) {
        return internal(this).i18n.addResources(...args);
    }

    translate(...args) {
        internal(this).i18n.translate(...args);
    }
}
