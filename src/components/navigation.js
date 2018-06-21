import { BaseComponent, define, prop } from '@dnajs/idom';

export class NavigationComponent extends BaseComponent {
    get properties() {
        return {
            navigation: prop(Boolean).default(true).attribute(),
        };
    }
}

define('navigation', NavigationComponent, {
    extends: 'div',
});
