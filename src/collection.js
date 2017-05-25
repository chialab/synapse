import { Model } from './model.js';

export class Collection extends Model {
    /**
     * The main model class for the collection.
     * @type {Model}
     */
    static get Model() {
        return Model;
    }
    /**
     * Initialize the collection.
     * @private
     * @param {Array} arr The initial array.
     * @returns {Promise}
     */
    initialize(arr) {
        this.array = [];
        this.listeners = [];
        return super.initialize()
            .then(() => {
                if (arr) {
                    this.add(...arr);
                }
                return Promise.resolve(this);
            });
    }

    model(data, Model) {
        return this.initClass(
            Model || this.constructor.Model,
            data
        );
    }

    get length() {
        return this.array.length;
    }

    reset() {
        this.remove(...this.array);
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

    find(map) {
        return this.array.find(map);
    }

    get(idx) {
        if (this.array[idx]) {
            return this.array[idx];
        }
    }

    getIndexById(id) {
        const arr = this.array;
        for (let i = 0, len = arr.length; i < len; i++) {
            if (arr[i].id === id) {
                return i;
            }
        }
        return -1;
    }

    getIndexByModel(model) {
        const arr = this.array;
        for (let i = 0, len = arr.length; i < len; i++) {
            if (arr[i] === model || (model.id && arr[i].id === model.id)) {
                return i;
            }
        }
        return -1;
    }

    findById(id) {
        const arr = this.array;
        let idx = this.getIndexById(id);
        if (idx !== -1) {
            return Promise.resolve(arr[idx]);
        }
        return Promise.reject();
    }

    findOrCreate(id) {
        const Ctr = this.constructor;
        const Model = Ctr.Model;
        return this.findById(id)
            .catch(() =>
                this.model({
                    [Model.key]: id,
                })
            );
    }

    findAll() {
        return Promise.resolve(this);
    }

    add(...values) {
        const Model = this.constructor.Model;
        let added = [];
        values.forEach((val) => {
            if (val instanceof Model) {
                this.array.push(val);
                this.listeners[this.array.length - 1] = val.on('change', (deleted) => {
                    if (deleted === true) {
                        this.remove(val);
                    } else {
                        this.trigger('change', {
                            type: 'update',
                            changed: [val],
                        });
                    }
                });
                added.push(val);
            }
        });
        if (added.length) {
            this.trigger('change', {
                type: 'add',
                added,
            });
        }
    }

    remove(...indexes) {
        let removed = [];
        indexes.forEach((index) => {
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
            }
            if (index < this.length) {
                let model = this.get(index);
                if (this.listeners[index]) {
                    this.listeners[index]();
                }
                this.listeners.splice(index, 1);
                this.array.splice(index, 1);
                removed.push(model);
            }
        });
        if (removed.length) {
            this.trigger('change', {
                type: 'remove',
                removed,
            });
        }
    }
}
