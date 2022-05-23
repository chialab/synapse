import type { Context, FunctionComponent } from '@chialab/dna';
import type { Response } from '../Router/Response';
import { Page } from './Page';

/**
 * A callback for animation listeners.
 */
type AnimationListener = (event: AnimationEvent) => void;

/**
 * Transition component properties.
 */
type TransitionProps = {
    response?: Response;
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
        store.set('previous', null);
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
            store.set('previous', null);
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
export const Transition: FunctionComponent<TransitionProps> = function Transition({ response, timeout }, context) {
    const { node, store } = context;

    const currentResponse = store.get('response') as Response | undefined;
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

    let previousResponse = store.get('previous') as Response | undefined;
    if (currentResponse !== response) {
        previousResponse = currentResponse;
        store.set('counter', 0);
        store.set('previous', currentResponse);
        store.set('response', response);
    }

    if (previousResponse) {
        return <>
            {previousResponse && <Page key={previousResponse} response={previousResponse} />}
            {response && <Page key={response} response={response} />}
        </>;
    }

    return <Page key={response} response={response} />;
};
