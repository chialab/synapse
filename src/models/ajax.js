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

    execFetch() {
        return fetch(`${this.endpoint}`, this.constructor.fetchOptions)
            .then((response) => response.json());
    }

    fetch(...args) {
        let Ctr = this.constructor;
        return Ctr.ready.then(() =>
            this.beforeFetch(...args).then(() => {
                if (this.endpoint) {
                    return this.execFetch(...args).then((data) => {
                        this.setResponse(data);
                        this.afterFetch(data).then((props) => {
                            this.set(props);
                            return Promise.resolve(props);
                        });
                    });
                }
                return Promise.reject();
            })
        );
    }
}
