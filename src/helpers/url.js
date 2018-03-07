import { Url, resolve, join, isAbsoluteUrl, isDataUrl } from '@chialab/proteins/src/url.js';

/**
 * @class UrlHelper
 * Handle urls.
 * @deprecated since version 2.3.0
 * Use @chialab/proteins~Url
 */
export class UrlHelper {
    static join(...paths) {
        return join(...paths);
    }

    static isAbsoluteUrl(url) {
        return isAbsoluteUrl(url);
    }

    static isDataUrl(url) {
        return isDataUrl(url);
    }

    static resolve(base, relative) {
        return resolve(base, relative);
    }

    constructor(url) {
        this.url = new Url(url);
    }

    isAbsoluteUrl() {
        return this.url.isAbsoluteUrl();
    }

    isDataUrl() {
        return this.url.isDataUrl();
    }

    resolve(path) {
        return this.url.resolve(path).href;
    }

    join(...paths) {
        return this.url.join(...paths).href;
    }
}
