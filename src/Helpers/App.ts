import type { Router } from '../Router/Router';
import { App } from '../App';

/**
 * Get parent application element.
 * @param node The DOM node.
 * @returns The application element instance or null.
 */
export function getApp(node: Node): App | null {
    if (node instanceof App) {
        return node;
    }
    if (node.parentNode) {
        return getApp((node.parentNode));
    }
    return null;
}

/**
 * Get the router instance used by the parent app.
 * @param node The DOM node.
 * @returns The application router or null.
 */
export function getRouter(node: Node): Router | null {
    return getApp(node)?.router ?? null;
}
