export class View {
    constructor(controller, options = {}) {
        this.content = document.createElement('div');
        this.update(options);
        if (controller) {
            this.content.controller = controller;
        }
    }

    update(options = {}) {
        for (let k in options) {
            if (options.hasOwnProperty(k)) {
                this.content[k] = options[k];
            }
        }
    }

    getContent() {
        return Promise.resolve(this.content);
    }

    destroy() {
        if (this.content && this.content.parentNode) {
            this.content.parentNode.removeChild(this.content);
        }
        return Promise.resolve();
    }
}
