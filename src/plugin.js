import { BaseObject } from './base.js';

export class Plugin extends BaseObject {
    static get dependencies() {
        return [];
    }

    initialize(owner, conf) {
        return super.initialize(owner, conf)
            .then(() => {
                this.configure(conf);
                return Promise.resolve();
            });
    }

    configure() {
        return true;
    }
}
