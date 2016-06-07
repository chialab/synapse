export class AppException extends Error {
    get defaultMessage() {
        return 'Generic app error';
    }

    constructor(message, err, ...args) {
        if (typeof message === 'undefined' || message instanceof Error) {
            err = message;
            message = this.defaultMessage;
        }
        if (err) {
            this.originalError = err;
            message = `${message}, from ${err.name}: ${err.message}.`;
        }
        super(message, ...args);
    }

    get originalStack() {
        return this.originalError && this.originalError.stack;
    }

    get originalMessage() {
        return this.originalError && this.originalError.message;
    }

    get originalName() {
        return this.originalError && this.originalError.name;
    }
}
