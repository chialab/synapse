import { AppException } from './app.js';

export class ContentException extends AppException {
    get defaultMessage() {
        return 'Generic content error.';
    }
}
