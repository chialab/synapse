import { PageView } from '../views/page.js';

export class PagesHelper {
    constructor(element) {
        this.wrapper = element || document.body;
    }

    get PageComponent() {
        return PageView;
    }

    add(view, immediate = true) {
        let page = new this.PageComponent(view);
        return view.getContent().then((content) => {
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
            return Promise.resolve(page);
        });
    }

    remove(page) {
        if (page) {
            return page.destroy();
        }
        return Promise.resolve();
    }
}
