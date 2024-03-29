import type { Context } from '@chialab/dna';
import { App } from '../App';
import type { Router } from '../Router/Router';

/**
 * Get parent application element.
 * @param nodeOrContext The DOM node or render context.
 * @returns The application element instance or null.
 */
export function getApp(nodeOrContext: Node | Context): App | null {
    const innerGetter = (node: Node): App | null => {
        if (node instanceof App) {
            return node;
        }
        if (node.parentNode) {
            return innerGetter(node.parentNode);
        }
        return null;
    };
    if (nodeOrContext instanceof Node) {
        return innerGetter(nodeOrContext);
    }
    if (nodeOrContext.node) {
        return innerGetter(nodeOrContext.node);
    }
    return null;
}

/**
 * Get the router instance used by the parent app.
 * @param nodeOrContext The DOM node or render context.
 * @returns The application router or null.
 */
export function getRouter(nodeOrContext: Node | Context): Router | null {
    return getApp(nodeOrContext)?.router ?? null;
}
