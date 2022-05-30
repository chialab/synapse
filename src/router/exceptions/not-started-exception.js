import { RouterException } from './router-exception.js';

/**
 * Fires when a Router's method has been invoked before `start` method.
 * @class RouterNotStartedException
 */
export class RouterNotStartedException extends RouterException {
    get defaultMessage() {
        return 'Router has not been started yet.';
    }

    get exceptionName() {
        return 'RouterNotStartedException';
    }
}
