export class Model {
    static get properties() {
        return [];
    }

    set(data) {
        let Ctr = this.constructor;
        for (let k in data) {
            if (data.hasOwnProperty(k) && Ctr.properties.indexOf(k) !== -1) {
                this[k] = data[k];
            }
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
