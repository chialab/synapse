import type { Context, FunctionComponent, Template } from '@chialab/dna';
import type { Response } from '../Router/Response';
import type { Router } from '../Router/Router';

/**
 * Transition page renderer.
 * @param data Page children.
 * @returns The page template.
 */
const TransitionPage: FunctionComponent<{
    response: Response;
}> = function TransitionPage({ children }) {
    return children;
};

/**
 * Render responses with page transitions.
 * @returns A template of pages to animate.
 */
export const Transition: FunctionComponent<{
    router: Router;
    renderer?: FunctionComponent;
}> = ({ router, renderer: Render = TransitionPage, children }, { useRenderContext, useEffect, useState }) => {
    const ctx: Context & {
        __response?: Response | null;
        __children?: Template;
    } = useRenderContext();
    const root = ctx.node as HTMLElement;
    const response = router.state?.response;
    const previousResponse = ctx.__response || response;
    const previousChildren = ctx.__children || children;
    const [, updateResponse] = useState(response);
    ctx.__response = response;
    ctx.__children = children;
    if (previousResponse && previousResponse !== response) {
        useEffect(() => {
            const previousElement = root.firstElementChild;
            if (!previousElement) {
                return;
            }
            const style = getComputedStyle(previousElement);
            const hasAnimations =
                (style.animationName !== 'none' && Number.parseFloat(style.animationDuration) > 0) ||
                (style.transitionDuration && Number.parseFloat(style.transitionDuration) > 0);
            if (!hasAnimations) {
                return;
            }

            let animationCount = 0;
            const onAnimationStart = () => {
                animationCount++;
            };
            const onAnimationEnd = () => {
                if (--animationCount === 0) {
                    updateResponse(response);
                }
            };
            root.addEventListener('animationstart', onAnimationStart, true);
            root.addEventListener('transitionstart', onAnimationStart, true);
            root.addEventListener('animationend', onAnimationEnd, true);
            root.addEventListener('animationcancel', onAnimationEnd, true);
            root.addEventListener('transitionend', onAnimationEnd, true);

            return () => {
                root.removeEventListener('animationstart', onAnimationStart, true);
                root.removeEventListener('transitionstart', onAnimationStart, true);
                root.removeEventListener('animationend', onAnimationEnd, true);
                root.removeEventListener('animationcancel', onAnimationEnd, true);
                root.removeEventListener('transitionend', onAnimationEnd, true);
            };
        }, [response]);

        return (
            <>
                {previousResponse && <Render response={previousResponse}>{previousChildren}</Render>}
                {response && <Render response={response}>{children}</Render>}
            </>
        );
    }

    if (!response) {
        return null;
    }

    return <Render response={response}>{children}</Render>;
};
