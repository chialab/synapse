/**
 * Trim slashes from the start a string.
 * @param token The string to trim.
 * @return THe trimmed string.
 */
export function trimSlashStart(token: string) {
    return token.replace(/^\/*/, '');
}

/**
 * Trim slashes from the end a string.
 * @param token The string to trim.
 * @return THe trimmed string.
 */
export function trimSlashEnd(token: string) {
    return token.replace(/\/*$/, '');
}

/**
 * Trim slashes from the start and end of a string.
 * @param token The string to trim.
 * @return THe trimmed string.
 */
export function trimSlash(token: string) {
    return trimSlashStart(trimSlashEnd(token));
}

/**
 * Relative url pathname object.
 * It represents the state of am url from its base.
 */
export class Path {
    #fullUrl: URL;
    #internalUrl: URL;

    /**
     * Create path.
     * @param origin Path origin.
     * @param base Path base url.
     * @param path Pathname.
     */
    constructor(origin: string, base: string, path: string) {
        this.#fullUrl = new URL(`/${[base, path]
            .map((chunk) => trimSlash(chunk))
            .filter((chunk) => !!chunk)
            .join('/')}`, origin);

        this.#internalUrl = new URL(`/${trimSlash(path)}`, origin);
    }

    /**
     * Get full url.
     */
    get url() {
        return new URL(this.#fullUrl);
    }

    /**
     * Pathname part.
     */
    get pathname() {
        return this.#internalUrl.pathname;
    }

    /**
     * Hash part.
     */
    get hash() {
        return this.#internalUrl.hash;
    }


    /**
     * Search part.
     */
    get search() {
        return this.#internalUrl.search;
    }

    /**
     * Path search params.
     */
    get searchParams() {
        return new URLSearchParams(this.#internalUrl.searchParams);
    }

    /**
     * Computed path url.
     */
    get href() {
        return `${this.pathname}${this.search}${this.hash}`;
    }
}
