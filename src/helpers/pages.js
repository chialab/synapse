import { PageView } from '../views/page.js';

export class PagesHelper {
    constructor(element) {
        this.wrapper = element || document.body;
    }

    get PageComponent() {
        return PageView;
    }

    add(content, immediate = true) {
        let page = new this.PageComponent();
        if (content instanceof Node) {
            page.appendChild(content);
        } else if (typeof content === 'string') {
            page.innerHTML = content;
        }
        if (!immediate) {
            page.hide(true);
        } else {
            page.show(true);
        }
        this.wrapper.appendChild(page);
        return page;
    }

    remove(page) {
        if (page && page.parentNode) {
            page.hide().then(() => {
                this.wrapper.removeChild(page);
            });
        }
    }
}
