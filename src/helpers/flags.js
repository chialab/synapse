export class FlagsHelpers {
    static get prefix() {
        return 'app.flags.';
    }

    static key(key) {
        if (key.indexOf(this.prefix) === 0) {
            return key;
        }
        return `${this.prefix}.${key}`;
    }

    static set(key, value) {
        key = this.key(key);
        return Promise.resolve(
            localStorage.setItem(key, value ? '1' : '0')
        );
    }

    static check(key) {
        key = this.key(key);
        let value = localStorage.getItem(key);
        if (value === '1') {
            return Promise.resolve();
        }
        return Promise.reject();
    }

    static enable(key) {
        return this.set(key, true);
    }

    static disable(key) {
        return this.set(key, true);
    }
}
