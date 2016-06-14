export class Model {
    static get properties() {
        return [];
    }

    set(data, value) {
        let Ctr = this.constructor;
        if (typeof data === 'object') {
            for (let k in data) {
                if (data.hasOwnProperty(k) && Ctr.properties.indexOf(k) !== -1) {
                    this[k] = data[k];
                }
            }
        } else if (typeof data === 'string') {
            this[data] = value;
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
