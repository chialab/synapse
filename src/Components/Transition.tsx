import type { FunctionComponent, Template } from '@chialab/dna';
import type { State } from '../Router/State';
import type { Router } from '../Router/Router';
import { window, Node } from '@chialab/dna';

/**
 * Transition page renderer.
 * @param data Page children.
 * @returns The page template.
 */
const TransitionPage: FunctionComponent = function Transition({ children }) {
    return children;
};

/**
 * Transition component properties.
 */
type TransitionProps = {
    router: Router;
    renderer?: FunctionComponent;
};

/**
 * Render responses with page transitions.
 * @param data Page data to render.
 * @param context The render context.
 * @returns A template of pages to animate.
 */
export const Transition: FunctionComponent<TransitionProps> = function Transition({ router, children, renderer: Renderer = TransitionPage }, context) {
    if (!router) {
        throw new Error('Transition router is required');
    }

    const { node, store, requestUpdate } = context;
    const currentState = store.get('state') as State | undefined;
    const root = node.parentElement;

    let previousState = store.get('previousState') as State | undefined;
    let previousChildren = store.get('previousChildren') as Template[] | undefined;
    if (currentState !== router.state) {
        if (root) {
            const start = function(event) {
                if (event.target.parentNode !== root) {
                    return;
                }

                const counter = (store.get('counter') as number || 0) + 1;
                store.set('counter', counter);
            };

            const end = function(event) {
                if (event.target.parentNode !== root) {
                    return;
                }

                const counter = (store.get('counter') as number || 0) - 1;
                store.set('counter', counter);

                if (counter === 0) {
                    flush();
                }
            };

            const flush = function() {
                root.removeEventListener('animationstart', start);
                root.removeEventListener('animationend', end);
                store.delete('previousState');
                store.delete('previousChildren');
                requestUpdate?.();
            };

            root.addEventListener('animationstart', start);
            root.addEventListener('animationend', end);
            setTimeout(() => {
                let node = context.start as Node;
                while (node && node !== context.end) {
                    node = node.nextSibling as Node;
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const style = window.getComputedStyle(node as HTMLElement);
                        const animation = style.getPropertyValue('animation-name');
                        const duration = style.getPropertyValue('animation-duration');
                        if (animation !== 'none' && duration !== '0s') {
                            return;
                        }
                    }
                }

                flush();
            });
        }

        previousState = currentState;
        previousChildren = store.get('children') as Template[] | undefined;
        store.set('previousState', previousState);
        store.set('previousChildren', previousChildren);
        store.set('counter', 0);
        store.set('children', children);
        store.set('state', router.state);
    }

    return <>
        {previousState && <Renderer key={previousState}>{previousChildren}</Renderer>}
        <Renderer key={router.state}>{children}</Renderer>
    </>;
};
