import { render } from '@dnajs/idom';
import { PageView } from '../views/page.js';

export class PagesHelper {
    constructor(element) {
        this.wrapper = element || document.body;
    }

    get PageComponent() {
        return PageView;
    }

    add(view, immediate = true) {
        return view.getContent().then((content) => {
            let page = render(this.wrapper, this.PageComponent);
            page.content = content;
            if (!immediate) {
                page.hide(true);
            } else {
                page.show(true);
            }
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
