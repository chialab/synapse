import { AppException } from './app.js';

export class RedirectException extends AppException {
    get defaultMessage() {
        return 'App has been redirect before navigation completion.';
    }

    get exceptionName() {
        return 'RedirectException';
    }
}
