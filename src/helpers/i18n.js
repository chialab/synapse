import { has, keypath } from '@chialab/proteins';

/**
 * Interpolate a string using the given arguments.
 * @private
 *
 * @param {String} str The string to parse.
 * @param {Array} args A list of variables to replace.
 * @return {String} The interpolated string.
 */
function interpolate(str, ...args) {
    return str.replace(/{(\d+)}/g, (match, index) => {
        if (typeof args[index] !== 'undefined') {
            return args[index];
        }
        return match;
    });
}

export class I18NHelper {
    /**
     * Detect user preferred language.
     *
     * @return {String}
     */
    static detect() {
        if (typeof navigator !== 'undefined') {
            let language = navigator.language || navigator.browserLanguage;
            return language.split('_')
                .shift()
                .split('-')
                .shift()
                .toLowerCase();
        }
        return null;
    }
    /**
     * A list of options for a I18N instance.
     * @namespace
     * @property {String} defaultLang The language to use.
      * ('auto' => try to detect the client lang from the browser).
     * @property {String} fallbackLang The fallback language to use.
     * @property {Boolean|String} autoLoad Should auto load JSON sources
     * ('auto' => check the protocol).
     * @property {String} path The path  where translations are located.
     * @property {String} filename The filename for the translations.
     * @property {Array} languages The list of supported languages.
     */
    get defaultOptions() {
        return {
            defaultLang: 'auto',
            fallbackLang: 'en',
            autoLoad: 'auto',
            path: 'locales',
            filename: 'translation',
            languages: ['en', 'es', 'de', 'fr', 'it'],
        };
    }
    /**
     * Internationalization library.
     * @class I18N
     *
     * @param {Object} options A set of options.
     * @return {String}
     */
    constructor(options = {}) {
        let opts = this.defaultOptions;
        for (let k in options) {
            if (has(opts, k)) {
                opts[k] = options[k];
            }
        }
        if (opts.autoLoad === 'auto' && window && window.location) {
            opts.autoLoad = (window.location.protocol !== 'file:');
        }
        if (opts.defaultLang === 'auto') {
            opts.defaultLang = I18NHelper.detect();
        }
        this.vocabularies = {};
        this.options = opts;
        if (opts.autoLoad) {
            this.fetch();
        }
    }
    /**
     * Load all languages.
     *
     * @return {Promise}
     */
    fetch() {
        return Promise.all(
            this.options.languages.map((lang) =>
                this.load(lang)
            )
        );
    }
    /**
     * Add data to local vocabularies.
     *
     * @param {Object} data The data to load.
     * @param {String} lang The language to set (use `defaultLang` if undefined).
     * @return {Object} The object instance.
     *
     * @example
     * var i18n = new I18N();
     * i18n.addResources(data); // it will use `en` lang.
     * i18n.addResources(data, 'it');
     */
    addResources(data, lang) {
        let options = this.options;
        lang = lang || options.defaultLang;
        this.vocabularies[lang] = this.vocabularies[lang] || {};
        for (let k in data) {
            if (has(data, k)) {
                this.vocabularies[lang][k] = data[k];
            }
        }
        return this;
    }
    /**
     * Load translations sources and add data to local vocabularies.
     *
     * @param {String} lang The language to load.
     * @param {String} filename The language to load.
     * @return {Promise}
     */
    load(lang, filename = null) {
        let options = this.options;
        filename = filename || options.filename;
        let path = `${options.path}/${lang}/${filename}.json`;
        return fetch(path)
            .then((res) => res.json())
            .then((data) => {
                this.addResources(data, lang);
                return Promise.resolve(data);
            });
    }
    /**
     * Return the interpolated translation for the provided key.
     * If unable to get the translation for the specified language,
     * try to use the fallback language.
     *
     * @param {String} path The key path for the translation.
     * @param {Array} args A list of variables for string interpolation.
     * @return {String} The translated string.
     *
     * @example
     * var i18n = new I18N({ defaultLang: 'it' });
     * i18n.addResource({ login: 'Chi sei?' });
     * i18n.addResource({ userInfo: { hello: 'Ciao, {0}!' }});
     * i18n.translate('login'); // => "Chi sei?"
     * i18n.translate('userInfo.hello', 'Alan'); // => "Ciao, Alan!"
     */
    translate(key, ...args) {
        let options = this.options;
        let lang = options.defaultLang;
        let t;
        if (key) {
            if (this.vocabularies[lang] && this.vocabularies[lang]) {
                t = keypath.get(this.vocabularies[lang], key);
            }
            if (!t && options.fallbackLang) {
                if (this.vocabularies[options.fallbackLang]) {
                    t = keypath.get(this.vocabularies[options.fallbackLang], key);
                }
            }
        }
        if (t) {
            t = interpolate(t, ...args);
        }
        return t;
    }
}
