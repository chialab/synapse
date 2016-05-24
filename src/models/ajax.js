import { Ajax } from 'chialab/ajax/src/ajax.js';
import { Model } from '../model.js';

export class AjaxModel extends Model {
    transformInputData(data) {
        return Promise.resolve(data);
    }

    fetch() {
        if (this.endpoint) {
            return Ajax.get(this.endpoint).then((data) =>
                Promise.resolve(data)
            , (xhr) => {
                // cordova status 0
                if (xhr && xhr.status === 0 &&
                    typeof xhr.response !== 'undefined' &&
                    xhr.response !== null) {
                    return Promise.resolve(xhr.response);
                }
                return Promise.reject(xhr);
            }).then((data) =>
                this.transformInputData(data).then((props) => {
                    this.set(props);
                    return Promise.resolve(props);
                })
            );
        }
        return Promise.reject();
    }
}
