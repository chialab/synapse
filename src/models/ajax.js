import { Model } from '../model.js';

export class AjaxModel extends Model {
    setFromResponse(data = {}) {
        if (data) {
            this.set(data, { validate: false, skipChanges: true });
        }
        return Promise.resolve(this);
    }
}
