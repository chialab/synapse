import { window } from '@chialab/dna';

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
