import { window } from '@chialab/dna';

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

    try {
        const { default: factory } = await import('node-fetch');
        return factory(input, init);
    } catch {
        //
    }

    throw new Error('Missing fetch implementation');
}
