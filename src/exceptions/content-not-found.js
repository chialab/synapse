import { ContentException } from './content.js';

export class ContentNotFoundException extends ContentException {
    get defaultMessage() {
        return 'Content not found';
    }

    get exceptionName() {
        return 'ContentNotFoundException';
    }
}
