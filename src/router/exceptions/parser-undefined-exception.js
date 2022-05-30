import { RouterException } from './router-exception.js';

/**
 * Fires when a Parser has not been defined.
 * @class ParserUndefinedException
 */
export class ParserUndefinedException extends RouterException {
    get defaultMessage() {
        return 'Parser for router instance is undefined.';
    }

    get exceptionName() {
        return 'ParserUndefinedException';
    }
}
