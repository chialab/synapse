import { BaseComponent, define } from '@dnajs/idom';

export class NavigationComponent extends BaseComponent {
    connectedCallback() {
        super.connectedCallback();
        this.setAttribute('navigation', '');
    }
}

define('page-navigation', NavigationComponent, {
    extends: 'div',
});
