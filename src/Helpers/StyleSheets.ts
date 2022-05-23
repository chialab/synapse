import { DOM, window } from '@chialab/dna';

/**
 * Cache links promises.
 */
const LINKS_MAP: Map<string, [HTMLLinkElement, Promise<HTMLLinkElement>]> = new Map();

/**
 * Load a stylesheet using a link element.
 * @param url Url to load.
 * @return A promise that resolves on link load.
 */
export function loadStyleSheet(url: string | URL): Promise<HTMLLinkElement> {
    const href = typeof url === 'string' ? url : url.href;
    const loader = LINKS_MAP.get(href);

    let promise;
    if (!loader) {
        const link = DOM.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';

        promise = new Promise<HTMLLinkElement>((resolve, reject) => {
            link.addEventListener('load', () => (link.parentNode ? resolve(link) : reject(link)));
            link.addEventListener('error', () => reject(link));
            link.addEventListener('abort', () => reject(link));
            link.href = href;
            window.document.head.appendChild(link);
        });
        LINKS_MAP.set(href, [link, promise]);
    } else {
        promise = loader[1];
    }

    return promise;
}

/**
 * Unload a stylesheet.
 * @param url Url of the stylesheet to unload.
 */
export function unloadStyleSheet(url: string | URL) {
    const href = typeof url === 'string' ? url : url.href;

    const loader = LINKS_MAP.get(href);
    if (!loader) {
        return;
    }

    const link = loader[0];
    window.document.head.removeChild(link);
    LINKS_MAP.delete(href);
}
