import { RouterException } from './router-exception.js';

/**
 * Fires when the Router's url does not match any rule.
 * @class RouterNotFoundException
 */
export class RouterNotFoundException extends RouterException {
    get defaultMessage() {
        return 'Router rule has not been found.';
    }

    get exceptionName() {
        return 'RouterNotFoundException';
    }
}
