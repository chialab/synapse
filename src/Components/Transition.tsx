import type { Context, FunctionComponent, Template } from '@chialab/dna';
import type { State } from '../Router/State';
import type { Router } from '../Router/Router';

/**
 * A callback for animation listeners.
 */
type AnimationListener = (event: AnimationEvent) => void;

/**
 * Transition component properties.
 */
type TransitionProps = {
    router: Router;
    timeout?: number;
};

/**
 * Transition component render context.
 */
type TransitionContext = Context<Node, TransitionProps>;

/**
 * Check if the animation event target is in the render context.
 * @param event The animation event.
 * @param context The render context.
 * @returns True if the target is rendered by the context, false otherwise.
 */
function isEventInContext(event: AnimationEvent, context: TransitionContext): boolean {
    const target = event.target;
    const { start, end } = context;

    let check = start;
    while (check && check !== end) {
        check = check.nextSibling as Node;
        if (check === target) {
            return true;
        }
    }

    return false;
}

/**
 * Create the animation start listener.
 * Trigger a re-render if transition start timed out.
 * @param context The render context.
 * @param timeout Transition start timeout.
 * @returns An animation listener callback.
 */
function createStartListener(context: TransitionContext, timeout = 100): AnimationListener {
    const { store, requestUpdate } = context;

    const noAnimationTimeout = setTimeout(() => {
        store.set('previousChildren', null);
        requestUpdate?.();
    }, timeout);

    return function(event) {
        if (!isEventInContext(event, context)) {
            return;
        }

        clearTimeout(noAnimationTimeout);
        const counter = (store.get('counter') as number || 0) + 1;
        store.set('counter', counter);
    };
}

/**
 * Create the animation end listener.
 * Trigger a re-render when page transition ends.
 * @param context The render context.
 * @returns An animation listener callback.
 */
function createEndListener(context: TransitionContext): AnimationListener {
    const { store, requestUpdate } = context;

    return function(event) {
        if (!isEventInContext(event, context)) {
            return;
        }

        const counter = (store.get('counter') as number || 0) - 1;
        store.set('counter', counter);

        if (counter === 0) {
            store.delete('previousChildren');
            requestUpdate?.();
        }
    };
}

/**
 * Render responses with page transitions.
 * @param data Page data to render.
 * @param context The render context.
 * @returns A template of pages to animate.
 */
export const Transition: FunctionComponent<TransitionProps> = function Transition({ router, children, timeout }, context) {
    if (!router) {
        throw new Error('Transition router is required');
    }

    const { node, store } = context;

    const currentState = store.get('state') as State | undefined;
    const previousRoot = store.get('root') as HTMLElement|undefined;
    const root = node.parentElement;
    if (root !== previousRoot) {
        const listeners = (store.get('listeners') ?? [
            createStartListener(context, timeout),
            createEndListener(context),
        ]) as [AnimationListener, AnimationListener];

        if (previousRoot) {
            previousRoot.removeEventListener('animationstart', listeners[0]);
            previousRoot.removeEventListener('animationend', listeners[1]);
        }
        if (root) {
            root.addEventListener('animationstart', listeners[0]);
            root.addEventListener('animationend', listeners[1]);
        }

        store.set('root', root);
        store.set('listeners', listeners);
    }

    let previousChildren = store.get('previousChildren') as Template[] | undefined;
    if (currentState !== router.state) {
        previousChildren = store.get('children') as Template[] | undefined;
        store.set('counter', 0);
        store.set('previousChildren', previousChildren);
        store.set('children', children);
        store.set('state', router.state);
    }

    return <>
        {previousChildren}
        {children}
    </>;
};
