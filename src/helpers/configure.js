import * as keypath from '@chialab/proteins/src/keypath.js';
import { isObject } from '@chialab/proteins/src/types.js';
import { internal } from './internal.js';

export class ConfigureHelper {
    constructor() {
        internal(this).conf = {};
    }

    write(path, value) {
        if (typeof path === 'object') {
            for (let k in path) {
                if (path.hasOwnProperty(k)) {
                    this.write(k, path[k]);
                }
            }
            return true;
        }
        if (isObject(value)) {
            for (let k in value) {
                if (value.hasOwnProperty(k)) {
                    this.write(`${path}.${k}`, value[k]);
                }
            }
            return true;
        }
        keypath.set(internal(this).conf, path, value);
        return true;
    }

    defaults(path, value) {
        if (typeof path === 'object') {
            for (let k in path) {
                if (path.hasOwnProperty(k)) {
                    this.defaults(k, path[k]);
                }
            }
            return true;
        }
        if (isObject(value)) {
            for (let k in value) {
                if (value.hasOwnProperty(k)) {
                    this.defaults(`${path}.${k}`, value[k]);
                }
            }
            return true;
        }
        if (typeof this.read(path) === 'undefined') {
            return this.write(path, value);
        }
        return true;
    }

    read(path) {
        if (path) {
            return keypath.get(internal(this).conf, path, undefined);
        }
        return internal(this).conf;
    }

    delete(path) {
        return keypath.del(internal(this).conf, path);
    }
}
