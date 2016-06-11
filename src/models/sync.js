import { AjaxModel } from './ajax.js';
import { DBModel } from './db.js';

export class SyncModel extends DBModel {
    fetch(...args) {
        return AjaxModel.prototype.fetch.call(this, ...args).then(
            () => this.sync(),
            () => super.fetch.call(this, ...args)
        );
    }
}
