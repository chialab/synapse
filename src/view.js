export class View {
    constructor(controller, options = {}) {
        let content = document.createElement('div');
        for (let k in options) {
            if (options.hasOwnProperty(k)) {
                content[k] = options[k];
            }
        }
        content.controller = controller;
        this.content = content;
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
