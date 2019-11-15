import { keypath, isObject } from '@chialab/proteins';
import { internal } from './internal.js';

export class ConfigureHelper {
    constructor() {
        internal(this).conf = {};
    }

    write(path, value) {
        if (typeof path === 'object') {
            for (let k in path) {
                this.write(k, path[k]);
            }
            return true;
        }
        if (isObject(value)) {
            for (let k in value) {
                this.write(`${path}.${k}`, value[k]);
            }
            return true;
        }
        keypath.set(internal(this).conf, path, value);
        return true;
    }

    defaults(path, value) {
        if (typeof path === 'object') {
            for (let k in path) {
                this.defaults(k, path[k]);
            }
            return true;
        }
        if (isObject(value)) {
            for (let k in value) {
                this.defaults(`${path}.${k}`, value[k]);
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
