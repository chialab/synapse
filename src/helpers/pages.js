import { DOM } from '@dnajs/idom';
import { PageView } from '../components/page.js';
import { debounce } from '../helpers/debounce.js';

export class PagesHelper {
    constructor(element) {
        this.wrapper = element || document.body;
    }

    get PageComponent() {
        return PageView;
    }

    add(view, immediate = true) {
        return view.getContent().then((content) => {
            let page = new this.PageComponent();
            return debounce(() => {
                DOM.appendChild(this.wrapper, page);
                page.content = content;
                return Promise.resolve(page);
            });
        });
    }

    remove(page) {
        if (page) {
            return page.destroy();
        }
        return Promise.resolve();
    }
}
