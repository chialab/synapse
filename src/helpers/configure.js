import objectPath from 'object-path';

export class ConfigureHelper {
    constructor() {
        this.__conf = {};
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
        return !!objectPath.set(this.__conf, path, value);
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
        return !!objectPath.ensureExists(this.__conf, path, value);
    }

    read(path) {
        return objectPath.get(this.__conf, path, undefined);
    }

    delete(path) {
        return objectPath.del(this.__conf, path);
    }
}
