import { window } from '@chialab/dna';

/**
 * requestAnimationFrame wrapper for support in Node environments.
 * @param callback The callback to invoke.
 * @returns The numeric handle of the request.
 */
export function requestAnimationFrame(callback: FrameRequestCallback): number {
    if (typeof window.requestAnimationFrame === 'function') {
        return window.requestAnimationFrame(callback);
    }

    const timeout = setTimeout(() => callback(Date.now()), 0);
    return timeout as unknown as number;
}

/**
 * cancelAnimationFrame wrapper for support in Node environments.
 * @param handle The handle to cancel.
 */
export function cancelAnimationFrame(handle: number) {
    if (typeof window.cancelAnimationFrame === 'function') {
        return window.cancelAnimationFrame(handle);
    }

    return clearTimeout(handle);
}
