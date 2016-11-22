import { prop, define, DOM } from '@dnajs/idom';
import { Component } from '../component.js';
import { debounce } from '../helpers/debounce.js';

export class PageViewComponent extends Component {
    get properties() {
        return {
            content: prop.ANY.observe('onContentChanged'),
        };
    }

    connectedCallback() {
        super.connectedCallback();
    }

    onContentChanged() {
        DOM.appendChild(this, this.content);
    }

    hide() {
        return debounce(() =>
            new Promise((resolve) => {
                let animationName = window.getComputedStyle(this).animationName;
                if (animationName !== 'none') {
                    this.setAttribute('animating', animationName);
                    let onAnimationEnd = () => {
                        this.removeEventListener('animationend', onAnimationEnd);
                        this.removeAttribute('animating');
                        resolve();
                    };
                    this.addEventListener('animationend', onAnimationEnd);
                } else {
                    resolve();
                }
            })
        );
    }

    show() {
        return debounce(() =>
            new Promise((resolve) => {
                let animationName = window.getComputedStyle(this).animationName;
                if (animationName !== 'none') {
                    this.setAttribute('animating', animationName);
                    let onAnimationEnd = () => {
                        this.removeEventListener('animationend', onAnimationEnd);
                        this.removeAttribute('animating');
                        resolve();
                    };
                    this.addEventListener('animationend', onAnimationEnd);
                } else {
                    resolve();
                }
            })
        );
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
