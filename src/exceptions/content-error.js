import { ContentException } from './content.js';

export class ContentErrorException extends ContentException {
    get defaultMessage() {
        return 'Content error';
    }

    get exceptionName() {
        return 'ContentErrorException';
    }
}
