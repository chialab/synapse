import { FetchModel } from './fetch.js';

export class AjaxModel extends FetchModel {
    static get fetchOptions() {
        return {};
    }

    beforeFetch() {
        return Promise.resolve();
    }

    afterFetch(data) {
        return Promise.resolve(data);
    }
}
