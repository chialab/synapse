import { RouterException } from './router-exception.js';

/**
 * Fires when a history navigation using `back`, `forward` and `go` method
 * tries to access to an entry out of the entries list limits.
 * @class OutOfHistoryException
 */
export class OutOfHistoryException extends RouterException {
    get defaultMessage() {
        return 'Out of history navigation.';
    }

    get exceptionName() {
        return 'OutOfHistoryException';
    }
}
