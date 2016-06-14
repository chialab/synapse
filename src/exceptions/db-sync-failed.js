import { AppException } from './app.js';

export class DBSyncFailedException extends AppException {
    get defaultMessage() {
        return 'An error occured syncing the database.';
    }

    get exceptionName() {
        return 'DBSyncFailedException';
    }

    constructor(db, err) {
        if (err instanceof Error) {
            super(undefined, err);
        } else {
            super(err);
        }
        this.database = db;
    }
}
