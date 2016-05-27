import { AjaxModel } from './ajax.js';
import { LocalModel } from './local.js';

export class SyncModel extends LocalModel {
    fetch(...args) {
        return AjaxModel.prototype.fetch.call(this, ...args).then(
            () => this.sync(),
            () => super.fetch.call(this, ...args)
        );
    }
}
