import { mix } from './helpers/mixin.js';
import SchemaModel from '@chialab/schema-model';
import { internal } from './helpers/internal.js';

import { BaseMixin } from './mixins/base.js';
import { InjectableMixin } from './mixins/injectable.js';
import { CallbackMixin } from './mixins/callback.js';
import { OwnableMixin } from './mixins/ownable.js';

export class Model extends mix(SchemaModel).with(
    BaseMixin,
    CallbackMixin,
    InjectableMixin,
    OwnableMixin
) {
    static get schema() {
        return undefined;
    }

    static get properties() {
        return [];
    }

    set(data, value, options = false) {
        if (typeof options === 'boolean') {
            options = {
                skipChanges: options,
            };
        }
        if (typeof data === 'object') {
            options = value || {};
            let changed = false;
            if (!options.skipChanges) {
                let data = this.toJSON();
                for (let k in data) {
                    if (this[k] !== data[k]) {
                        changed = true;
                        this.setChanges(k, this[k], data[k]);
                    }
                }
            }
            super.set(data, options);
            if (changed) {
                this.trigger('change');
            }
        } else if (typeof data === 'string') {
            let s = {};
            s[data] = value;
            this.set(s, options);
        }
    }

    resetChanges() {
        internal(this).changes = {};
    }

    setChanges(key, oldValue, newValue) {
        internal(this).changes = internal(this).changes || {};
        internal(this).changes[key] = {
            oldValue,
            newValue,
        };
    }

    getChanges() {
        return internal(this).changes || {};
    }

    changed() {
        return Object.keys(this.getChanges());
    }

    hasChanges() {
        return !!this.changed().length;
    }

    validate(...args) {
        if (this.constructor.schema) {
            return super.validate(...args);
        } else {
            return { valid: true };
        }
    }

    toJSON() {
        let Ctr = this.constructor;
        if (Ctr.schema) {
            return super.toJSON();
        }
        let res = {};
        (Ctr.properties || []).forEach((key) => {
            res[key] = this[key];
        });
        return res;
    }
}

Model.ready = Promise.resolve();
