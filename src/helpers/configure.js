import objectPath from 'object-path';
import { internal } from './internal.js';

function isObject(value) {
    return typeof value !== 'undefined' &&
        value !== null &&
        value.constructor === Object;
}

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
        objectPath.set(internal(this).conf, path, value);
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
        return objectPath.get(internal(this).conf, path, undefined);
    }

    delete(path) {
        return objectPath.del(internal(this).conf, path);
    }
}
