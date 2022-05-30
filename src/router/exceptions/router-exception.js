Object.setPrototypeOf = Object.setPrototypeOf || function(obj, proto) {
    // eslint-disable-next-line
    obj.__proto__ = proto;
    return obj;
};

/**
 * Generic Router exceptions.
 * @class RouterException
 */
export class RouterException {
    get defaultMessage() {
        return 'Generic Router error';
    }

    get exceptionName() {
        return 'RouterException';
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
        err.name = this.constructor.exceptionName;
        Object.setPrototypeOf(err, this.constructor.prototype);
        return err;
    }
}
