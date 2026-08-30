import { useMemo, useRenderContext } from '@chialab/dna';
import type { App } from './App';
import { getApp, getRouter } from './Helpers/App';
import type { Router } from './Router/Router';

/**
 * Get the parent application element from within a function component.
 * @returns The application element instance or null.
 */
export function useApp(): App | null {
    const context = useRenderContext();
    return useMemo(() => getApp(context), [context]);
}

/**
 * Get the router instance used by the parent app, from within a function component.
 * @returns The application router or null.
 */
export function useRouter(): Router | null {
    const context = useRenderContext();
    return useMemo(() => getRouter(context), [context]);
}
