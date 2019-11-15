import { Url } from '@chialab/proteins';

/**
 * @class UrlHelper
 * Handle urls.
 * @deprecated since version 2.3.0
 * Use @chialab/proteins~Url
 */
export class UrlHelper {
    static join(...paths) {
        return Url.join(...paths);
    }

    static isAbsoluteUrl(url) {
        return Url.isAbsoluteUrl(url);
    }

    static isDataUrl(url) {
        return Url.isDataUrl(url);
    }

    static resolve(base, relative) {
        return Url.resolve(base, relative);
    }

    constructor(url) {
        this.url = new Url.Url(url);
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
