import { DOM, window } from '@chialab/dna';

/**
 * Cache scripts promises.
 */
const SCRIPTS: Map<string, Promise<void>> = new Map();

/**
 * Load a script using a <script> element.
 * @param url Url to load.
 * @param reload Should reload the script.
 * @returns A promise that resolves on script load.
 */
export function loadScript(url: string | URL, reload = false) {
    const href = typeof url === 'string' ? url : url.href;

    let promise = SCRIPTS.get(href);
    if (!promise || reload) {
        const script = DOM.createElement('script');
        script.src = href;

        promise = new Promise<void>((resolve, reject) => {
            script.addEventListener('load', () => resolve());
            script.addEventListener('error', () => reject());
            script.addEventListener('abort', () => reject());
            window.document.head.appendChild(script);
        });

        SCRIPTS.set(href, promise);
    }

    return promise;
}
