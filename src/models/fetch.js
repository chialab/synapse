import { internal } from '../helpers/internal.js';
import { Model } from '../model.js';

export class FetchModel extends Model {
    getResponse() {
        return internal(this).response;
    }

    setResponse(response) {
        internal(this).response = response;
    }

    fetch() {
        return Promise.resolve();
    }

    setFromResponse(data = {}) {
        this.set(data);
        this.resetChanges();
        return Promise.resolve();
    }
}
