import { prop, define, BaseComponent, DOM } from '@dnajs/idom';

export class PageViewComponent extends BaseComponent {
    get properties() {
        return {
            content: prop.ANY.observe('onContentChanged'),
        };
    }

    onContentChanged() {
        DOM.appendChild(this, this.content);
    }

    hide() {
        return new Promise((resolve) => {
            DOM.setAttribute(this, 'hidden', '');
            resolve();
        });
    }

    show() {
        return new Promise((resolve) => {
            DOM.removeAttribute(this, 'hidden');
            resolve();
        });
    }

    destroy() {
        this.hide().then(() => {
            if (this && this.parentNode) {
                DOM.removeChild(this.parentNode, this);
            }
        });
        return Promise.resolve();
    }
}

define('page-view', PageViewComponent, {
    extends: 'section',
});

export const PageView = () => new PageViewComponent();
