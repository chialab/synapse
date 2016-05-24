import { AjaxModel } from './ajax.js';
import { LocalModel } from './local.js';

export class CacheModel extends LocalModel {
    transformInputData(...args) {
        return AjaxModel.prototype.transformInputData.call(this, ...args);
    }

    fetch(...args) {
        return AjaxModel.prototype.fetch.call(this, ...args).then(
            () => this.sync(),
            () => LocalModel.prototype.fetch.call(this, ...args)
        );
    }
}
