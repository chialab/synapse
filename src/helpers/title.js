let title = document.head.querySelector('title') || (() => {
    let t = document.createElement('title');
    document.head.appendChild(t);
    return t;
})();

export class TitleHelper {
    get defaultTitle() {
        return this.options.defaultTitle || '';
    }

    constructor(options = {}) {
        this.options = options;
        this.reset();
    }

    reset() {
        this.states = [];
        this.update();
    }

    build() {
        return this.states.join(' - ');
    }

    update() {
        let txt;
        if (this.states && this.states.length) {
            txt = this.build();
        } else {
            txt = this.defaultTitle;
        }
        title.textContent = txt;
    }

    get() {
        return title.textContent;
    }

    set(newTitle) {
        if (typeof newTitle === 'string') {
            newTitle = [newTitle];
        }
        this.states = newTitle;
        this.update();
    }

    pushState(chunk) {
        this.states.push(chunk);
        this.update();
    }

    replaceState(chunk, pos) {
        if (typeof pos === 'undefined') {
            pos = this.states.length - 1;
        }
        this.states[pos] = chunk;
        this.update();
    }

    removeState(num = 1) {
        this.states = this.states.slice(-num);
        this.update();
    }
}
