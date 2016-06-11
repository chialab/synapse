import { Ajax } from 'chialab/ajax/src/ajax.js';
import { Model } from '../model.js';

export class AjaxModel extends Model {
    get fetchOptions() {
        return {};
    }

    beforeFetch() {
        return Promise.resolve();
    }

    afterFetch(data) {
        return Promise.resolve(data);
    }

    execFetch() {
        return Ajax.get(`${this.endpoint}`, this.fetchOptions).then((data) =>
            Promise.resolve(data)
        , (xhr) => {
            // cordova status 0
            if (xhr && xhr.status === 0 &&
                typeof xhr.response !== 'undefined' &&
                xhr.response !== null) {
                return Promise.resolve(xhr.response);
            }
            return Promise.reject(xhr);
        });
    }

    fetch(...args) {
        let Ctr = this.constructor;
        return Ctr.ready.then(() =>
            this.beforeFetch(...args).then(() => {
                if (this.endpoint) {
                    return this.execFetch(...args).then((data) =>
                        this.afterFetch(data).then((props) => {
                            this.set(props);
                            return Promise.resolve(props);
                        })
                    );
                }
                return Promise.reject();
            })
        );
    }
}
