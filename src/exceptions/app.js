export class AppException {
    get defaultMessage() {
        return 'Generic app error';
    }

    constructor(message, original, ...args) {
        let err = new Error(message, ...args);
        if (typeof message === 'undefined') {
            err.message = this.defaultMessage;
        } else if (message instanceof Error) {
            original = message;
            err.message = this.defaultMessage;
        }
        if (original) {
            err.originalError = original;
            err.message = `${err.message}, from ${original.name}: ${original.message}.`;
        }
        err.name = this.constructor.name;
        Object.setPrototypeOf(err, this.constructor.prototype);
        return err;
    }
}
