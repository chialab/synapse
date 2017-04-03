import { Model } from './model.js';

export class Collection extends Model {
    /**
     * The main model class for the collection.
     * @type {Model}
     */
    static get Entry() {
        return Model;
    }
    /**
     * Construct a new collection.
     * @param {Array} arr An initial array. 
     */
    constructor(arr) {
        super(arr);
        this.array = [];
        this.listeners = [];
    }
    /**
     * Initialize the collection.
     * @private
     * @param {Array} arr The initial array.
     * @returns {Promise}
     */
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

    forEach(...args) {
        return this.array.map(...args);
    }

    map(...args) {
        return this.array.map(...args);
    }

    filter(...args) {
        return this.array.filter(...args);
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

    getIndexByModel(model) {
        const arr = this.array;
        for (let i = 0, len = arr.length; i < len; i++) {
            if (arr[i] === model || (model.id && arr[i].id === model.id)) {
                return Promise.resolve(i);
            }
        }
        return Promise.reject();
    }

    entry(data) {
        return this.initClass(
            this.constructor.Entry,
            data
        );
    }

    findById(id) {
        const arr = this.array;
        return this.getIndexById(id)
            .then((idx) =>
                Promise.resolve(arr[idx])
            );
    }

    findOrCreate(id) {
        const Ctr = this.constructor;
        const Entry = Ctr.Entry;
        return this.findById(id)
            .catch(() =>
                this.entry({
                    [Entry.key]: id,
                })
            );
    }

    find(map) {
        return this.initClass(this.constructor, this.array.find(map));
    }

    findAll() {
        return this.initClass(this.constructor, this.array);
    }

    add(val, index) {
        const Entry = this.constructor.Entry;
        if (val instanceof Entry) {
            if (index === undefined) {
                index = this.array.length;
            }
            if (this.listeners[index]) {
                this.listeners[index]();
            }
            this.array[index] = val;
            this.listeners[this.array.length - 1] = val.on('change', (deleted) => {
                if (deleted) {
                    this.remove(val);
                } else {
                    this.trigger('change');
                    this.trigger('updated', index);
                }
            });
            this.trigger('change');
            this.trigger('added', index, val);
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
        return this.get(index)
            .then((val) => {
                if (this.listeners[index]) {
                    this.listeners[index]();
                }
                this.listeners.splice(index, 1);
                this.array.splice(index, 1);
                this.trigger('change');
                this.trigger('removed', index, val);
                return Promise.resolve(index);
            });
    }
}
