import type { FunctionComponent, Template } from '@chialab/dna';
import type { Router } from '../Router/Router';
import type { State } from '../Router/State';

/**
 * Transition page renderer.
 * @param data Page children.
 * @returns The page template.
 */
const TransitionPage: FunctionComponent = function TransitionPage({ children }) {
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
 * @param hooks The render hooks.
 * @param context The render context.
 * @returns A template of pages to animate.
 */
export const Transition: FunctionComponent<TransitionProps> = function Transition(
    { router, children, renderer: Renderer = TransitionPage },
    { useState },
    context
) {
    if (!router) {
        throw new Error('Transition router is required');
    }

    if (!context.node) {
        return <Renderer key={router.state}>{children}</Renderer>;
    }

    const root = context.node.parentElement;
    const [counter, setCounter] = useState(0);
    const [routerState, setRouterState] = useState<State | null>(null);
    const [currentChildren, setCurrentChildren] = useState<Template>(null);

    if (routerState !== router.state) {
        if (root) {
            const start = function (event: AnimationEvent) {
                const target = event.target as HTMLElement;
                if (target.parentNode !== root) {
                    return;
                }

                setCounter(counter + 1);
            };

            const end = function (event: AnimationEvent) {
                const target = event.target as HTMLElement;
                if (target.parentNode !== root) {
                    return;
                }

                setCounter(counter - 1);

                if (counter === 0) {
                    flush();
                }
            };

            const flush = function () {
                root.removeEventListener('animationstart', start);
                root.removeEventListener('animationend', end);
                setRouterState(null);
            };

            root.addEventListener('animationstart', start);
            root.addEventListener('animationend', end);
            setTimeout(() => {
                let node = context.node as Node;
                while (node && node !== context.end?.node) {
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

        setCurrentChildren(children);
        setRouterState(router.state || null);
    }

    return (
        <>
            {routerState && <Renderer key={routerState}>{currentChildren}</Renderer>}
            <Renderer key={router.state}>{children}</Renderer>
        </>
    );
};
