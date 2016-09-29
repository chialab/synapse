import { Factory } from './factory.js';

export class View extends Factory {
    initialize(controller, options = {}) {
        super.initialize(controller);
        this.content = document.createElement('div');
        options.controller = controller;
        this.addReadyPromise(this.update(options));
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
