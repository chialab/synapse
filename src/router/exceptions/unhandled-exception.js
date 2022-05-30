import { RouterException } from './router-exception.js';

/**
 * Fires when the Route callback rejects to handle the current state.
 * @class RouterUnhandledException
 */
export class RouterUnhandledException extends RouterException {
    get defaultMessage() {
        return 'Route callback handling rejected.';
    }

    get exceptionName() {
        return 'RouterUnhandledException';
    }
}
