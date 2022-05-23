import { DOM, window } from '@chialab/dna';

/**
 * Cache links promises.
 */
const LINKS: Map<string, [HTMLLinkElement, Promise<HTMLLinkElement>]> = new Map();

/**
 * Load a stylesheet using a <link> element.
 * @param url Url to load.
 * @param reload Should reload the link.
 * @return A promise that resolves on link load.
 */
export function loadStyleSheet(url: string | URL, reload = false): Promise<HTMLLinkElement> {
    const href = typeof url === 'string' ? url : url.href;
    const loader = LINKS.get(href);

    let promise;
    if (!loader || reload) {
        const link = DOM.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = href;

        promise = new Promise<HTMLLinkElement>((resolve, reject) => {
            link.addEventListener('load', () => (link.parentNode ? resolve(link) : reject(link)));
            link.addEventListener('error', () => reject(link));
            link.addEventListener('abort', () => reject(link));
            window.document.head.appendChild(link);
        });

        LINKS.set(href, [link, promise]);
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

    const loader = LINKS.get(href);
    if (!loader) {
        return;
    }

    const link = loader[0];
    window.document.head.removeChild(link);
    LINKS.delete(href);
}
