import { FetchCollection } from './fetch.js';
import { AjaxModel } from '../models/ajax.js';

export class AjaxCollection extends FetchCollection {
    static get Entry() {
        return AjaxModel;
    }

    setEntryData(model, data) {
        model.set(data, true);
    }

    findAll(options = {}) {
        options.endpoint = options.endpoint || this.endpoint;
        return this.execFetch(options)
            .then((res) => 
                this.setFromResponse(res)
            );
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
