export class FlagsHelper {
    constructor(prefix) {
        this.prefix = prefix || 'app.flags.';
    }

    key(key) {
        if (key.indexOf(this.prefix) === 0) {
            return key;
        }
        return `${this.prefix}.${key}`;
    }

    set(key, value) {
        key = this.key(key);
        return Promise.resolve(
            localStorage.setItem(key, value ? '1' : '0')
        );
    }

    check(key) {
        key = this.key(key);
        let value = localStorage.getItem(key);
        if (value === '1') {
            return Promise.resolve();
        }
        return Promise.reject();
    }

    enable(key) {
        return this.set(key, true);
    }

    disable(key) {
        return this.set(key, true);
    }
}
