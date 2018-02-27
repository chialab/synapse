import mix from '@chialab/proteins/src/mixin.js';
import { ComponentMixin } from './component.js';
import { ControllerMixin } from './controller.js';

export const PageMixin = (SuperClass) => class extends mix(SuperClass).with(ComponentMixin, ControllerMixin) {
    hide() {
        this.node.classList.remove('navigation--show');
        this.node.classList.add('navigation--hide');
        return new Promise((resolve) => {
            let animationName = window.getComputedStyle(this.node).animationName;
            if (animationName && animationName !== 'none') {
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
            if (animationName && animationName !== 'none') {
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
        return this.hide()
            .then(() =>
                (super.destroy ? super.destroy() : Promise.resolve())
            );
    }
};
