import { define } from '@dnajs/idom';
import { Component } from '../component.js';

export class PageViewComponent extends Component {
    hide() {
        this.node.classList.remove('navigation--show');
        this.node.classList.add('navigation--hide');
        return new Promise((resolve) => {
            let animationName = window.getComputedStyle(this.node).animationName;
            if (animationName !== 'none') {
                let onAnimationEnd = () => {
                    this.node.classList.remove('navigation--hide');
                    this.node.removeEventListener('animationend', onAnimationEnd);
                    resolve();
                };
                this.node.addEventListener('animationend', onAnimationEnd);
            } else {
                this.node.classList.remove('navigation--hide');
                resolve();
            }
        });
    }

    show() {
        this.node.classList.add('navigation--show');
        return new Promise((resolve) => {
            let animationName = window.getComputedStyle(this.node).animationName;
            if (animationName !== 'none') {
                let onAnimationEnd = () => {
                    this.node.classList.remove('navigation--show');
                    this.node.removeEventListener('animationend', onAnimationEnd);
                    resolve();
                };
                this.node.addEventListener('animationend', onAnimationEnd);
            } else {
                this.node.classList.remove('navigation--show');
                resolve();
            }
        });
    }

    destroy() {
        this.hide();
        return Promise.resolve();
    }
}

define('page-view', PageViewComponent, {
    extends: 'section',
});
