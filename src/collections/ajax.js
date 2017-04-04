import { internal } from '@chialab/synapse';
import { FetchCollection } from './fetch.js';
import { AjaxModel } from '../models/ajax.js';

export class AjaxCollection extends FetchCollection {
    static get Entry() {
        return AjaxModel;
    }

    findAll(options = {}) {
        if (!internal(this).finding) {
            options.endpoint = options.endpoint || this.endpoint;
            internal(this).finding = this.execFetch(options)
                .then((res) => {
                    internal(this).finding = null;
                    return this.setFromResponse(res);
                });
        }
        return internal(this).finding;
    }

    findById(id) {
        const Ctr = this.constructor;
        const Entry = Ctr.Entry;

        return super.findById(id)
            .catch(() =>
                this.entry({ [Entry.key]: id })
                    .then((model) => 
                        this.fetch(model)
                    )
            );
    }
}
