import { RouterException } from './router-exception.js';

/**
 * Fires when the Router tries to referred to a state which does not exist.
 * @class RouterInvalidException
 */
export class RouterInvalidException extends RouterException {
    get defaultMessage() {
        return 'Router state does not exist.';
    }

    get exceptionName() {
        return 'RouterInvalidException';
    }
}
