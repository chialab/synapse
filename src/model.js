import { CallbackHelper } from './helpers/callback.js';

export class Model {
    static get properties() {
        return [];
    }

    constructor() {
        CallbackHelper.define(this);
    }

    set(data, value) {
        let Ctr = this.constructor;
        if (typeof data === 'object') {
            for (let k in data) {
                if (data.hasOwnProperty(k) && Ctr.properties.indexOf(k) !== -1) {
                    let desc = Object.getOwnPropertyDescriptor(Ctr.prototype, k);
                    if (!desc || typeof desc.get !== 'function' || typeof desc.set === 'function') {
                        this[k] = data[k];
                    }
                }
            }
        } else if (typeof data === 'string') {
            let s = {};
            s[data] = value;
            this.set(s);
        }
    }

    toJSON() {
        let Ctr = this.constructor;
        let res = {};
        (Ctr.properties || []).forEach((key) => {
            res[key] = this[key];
        });
        return res;
    }
}

Model.ready = Promise.resolve();
