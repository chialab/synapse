import { I18N } from 'chialab/i18n/src/i18n.js';

export class I18NHelper {
    constructor(options = {}) {
        this.i18n = new I18N(options);
    }

    translate(str, ...args) {
        this.i18n.translate(str, ...args);
    }
}
