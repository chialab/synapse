import { BaseObject } from './base.js';

export class View extends BaseObject {
    constructor(controller, options = {}) {
        super();
        this.setOwner(controller.getOwner());
        this.content = document.createElement('div');
        options.controller = controller;
        this.readyPromise = this.update(options);
    }

    ready() {
        return this.readyPromise;
    }

    update(options = {}) {
        for (let k in options) {
            if (options.hasOwnProperty(k)) {
                this.content[k] = options[k];
            }
        }
        return Promise.resolve();
    }

    getContent() {
        return Promise.resolve(this.content);
    }

    destroy(...args) {
        super.destroy(...args);
        if (this.content && this.content.parentNode) {
            this.content.parentNode.removeChild(this.content);
        }
        return Promise.resolve();
    }
}
