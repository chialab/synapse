import { AppException } from './app.js';

export class DBOpeningErrorException extends AppException {
    get defaultMessage() {
        return 'An error occured opening the database connection.';
    }

    get exceptionName() {
        return 'DBOpeningErrorException';
    }

    constructor(err) {
        super(undefined, err);
    }
}
