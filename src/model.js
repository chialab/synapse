import { BaseObject } from './base.js';

export class Model extends BaseObject {
    static get properties() {
        return [];
    }

    constructor() {
        super();
        this.initialize();
    }

    set(data, value, skipChanges = false) {
        let Ctr = this.constructor;
        if (typeof data === 'object') {
            skipChanges = value || false;
            for (let k in data) {
                if (data.hasOwnProperty(k) && Ctr.properties.indexOf(k) !== -1) {
                    let desc = Object.getOwnPropertyDescriptor(Ctr.prototype, k);
                    if (!desc || typeof desc.get !== 'function' || typeof desc.set === 'function') {
                        if (this[k] !== data[k]) {
                            if (!skipChanges) {
                                this.setChanges(k, this[k], data[k]);
                            }
                            this[k] = data[k];
                        }
                    }
                }
            }
        } else if (typeof data === 'string') {
            let s = {};
            s[data] = value;
            this.set(s, skipChanges);
        }
    }

    resetChanges() {
        this.__changes = {};
    }

    setChanges(key, oldValue, newValue) {
        this.__changes = this.__changes || {};
        this.__changes[key] = {
            oldValue,
            newValue,
        };
    }

    getChanges() {
        return this.__changes || {};
    }

    changed() {
        return Object.keys(this.getChanges());
    }

    hasChanges() {
        return !!this.changed().length;
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
