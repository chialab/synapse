import { FetchCollection } from './fetch.js';
import { AjaxModel } from '../models/ajax.js';

export class AjaxCollection extends FetchCollection {
    static get Model() {
        return AjaxModel;
    }

    findAll(options = {}) {
        options.endpoint = options.endpoint || this.endpoint;
        return this.beforeFetch(options)
            .then((options) =>
                this.execFetch(options)
                    .then((res) =>
                        this.afterFetch(res)
                            .then((res) =>
                                this.setFromResponse(res)
                            )
                            .then((models) => {
                                this.reset();
                                this.add(...models);
                            })
                    )
            );
    }

    findById(id, options = {}) {
        const Ctr = this.constructor;
        const Model = Ctr.Model;

        return super.findById(id, options)
            .catch(() =>
                this.model({ [Model.key]: id })
                    .then((model) =>
                        this.fetch(model, options)
                    )
            );
    }
}
