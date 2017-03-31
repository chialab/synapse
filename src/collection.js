import { Model } from '@chialab/synapse';

export class Collection extends Model {
    static get(arr, idx) {
        return arr[idx];
    }

    constructor(...args) {
        super(...args);
        this.array = [];
        this.listeners = [];
    }

    initialize(arr) {
        return super.initialize()
            .then(() => {
                if (arr) {
                    arr.forEach((val) => this.add(val));
                }
                return Promise.resolve();
            });
    }

    get length() {
        return this.array.length;
    }

    get(idx) {
        if (this.array[idx]) {
            return Promise.resolve(this.array[idx]);
        }
        return Promise.reject();
    }

    getIndexById(id) {
        const arr = this.array;
        for (let i = 0, len = arr.length; i < len; i++) {
            if (arr[i].id === id) {
                return Promise.resolve(i);
            }
        }
        return Promise.reject();
    }

    findById(id) {
        const arr = this.array;
        return this.getIndexById(id)
            .then((idx) =>
                Promise.resolve(arr[idx])
            );
    }

    getIndexByModel(model) {
        const arr = this.array;
        for (let i = 0, len = arr.length; i < len; i++) {
            if (arr[i] === model || (model.id && arr[i].id === model.id)) {
                return Promise.resolve(i);
            }
        }
        return Promise.reject();
    }

    add(val, index) {
        if (val instanceof Model) {
            if (index === undefined) {
                index = this.array.length;
            }
            if (this.listeners[index]) {
                this.listeners[index]();
            }
            this.array[index] = val;
            this.listeners[this.array.length - 1] = val.on('change', () => {
                if (val.get('deleted', { internal: true })) {
                    this.remove(val);
                } else {
                    this.trigger('change');
                    this.trigger('updated', index);
                }
            });
            this.trigger('change');
            this.trigger('added', index);
            return Promise.resolve(index);
        }
        return Promise.reject();
    }

    remove(index) {
        if (typeof index !== 'number') {
            if (index instanceof Model) {
                if (index.id) {
                    index = this.getIndexById(index.id);
                } else {
                    index = this.getIndexByModel(index);
                }
            } else if (typeof index === 'string') {
                index = this.getIndexById(index);
            }
            return index.then((idx) => this.remove(idx));
        }
        if (index >= this.length) {
            return Promise.reject();
        }
        if (this.listeners[index]) {
            this.listeners[index]();
        }
        this.listeners.splice(index, 1);
        this.array.splice(index, 1);
        this.trigger('change');
        this.trigger('removed', index);
        return Promise.resolve(index);
    }

    forEach(...args) {
        return this.array.map(...args);
    }

    map(...args) {
        return this.array.map(...args);
    }

    filter(...args) {
        return this.array.filter(...args);
    }
}
