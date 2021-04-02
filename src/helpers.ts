import { DOM, window } from '@chialab/dna';

/**
 * requestAnimationFrame wrapper for support in Node environments.
 * @param callback The callback to invoke.
 * @return The numeric handle of the request.
 */
export function requestAnimationFrame(callback: FrameRequestCallback): number {
    if (typeof window.requestAnimationFrame === 'function') {
        return window.requestAnimationFrame(callback);
    }

    return window.setTimeout(() => callback(Date.now()), 0);
}

/**
 * cancelAnimationFrame wrapper for support in Node environments.
 * @param handle The handle to cancel.
 */
export function cancelAnimationFrame(handle: number) {
    if (typeof window.cancelAnimationFrame === 'function') {
        return window.cancelAnimationFrame(handle);
    }

    return window.clearTimeout(handle);
}

/**
 * Fetch wrapper for support in Node environments.
 * @param input The url to fetch or options.
 * @param init Init options for the request.
 * @return A promise that resolves a response.
 */
export async function fetch(input: RequestInfo, init?: RequestInit | undefined): Promise<Response> {
    if (typeof window.fetch === 'function') {
        return window.fetch(input, init);
    }

    let { default: factory } = await import('node-fetch');
    return factory(input, init);
}

/**
 * Cache links promises.
 */
const LINKS_MAP: Map<string, Promise<HTMLLinkElement>> = new Map();

/**
 * Load a stylesheet using a link element.
 * @param url Url to load.
 * @return A promise that resolves on link load.
 */
export function loadStyleSheet(url: string | URL): Promise<HTMLLinkElement> {
    let href = typeof url === 'string' ? url : url.href;
    if (!LINKS_MAP.has(href)) {
        let promise = new Promise((resolve, reject) => {
            let link = DOM.createElement('link');
            link.type = 'text/css';
            link.rel = 'stylesheet';
            link.addEventListener('load', () => resolve(link));
            link.addEventListener('error', () => reject(link));
            link.addEventListener('abort', () => reject(link));
            link.href = href;
            window.document.head.appendChild(link);
        }) as Promise<HTMLLinkElement>;
        LINKS_MAP.set(href, promise);
    }

    return LINKS_MAP.get(href) as Promise<HTMLLinkElement>;
}
