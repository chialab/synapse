/**
 * Trim slashes from the start a string.
 * @param token The string to trim.
 * @returns THe trimmed string.
 */
export function trimSlashStart(token: string): string {
    return token.replace(/^\/*/, '');
}

/**
 * Trim slashes from the end a string.
 * @param token The string to trim.
 * @returns THe trimmed string.
 */
export function trimSlashEnd(token: string): string {
    return token.replace(/\/*$/, '');
}

/**
 * Trim slashes from the start and end of a string.
 * @param token The string to trim.
 * @returns THe trimmed string.
 */
export function trimSlash(token: string): string {
    return trimSlashStart(trimSlashEnd(token));
}

/**
 * Relative url pathname object.
 * It represents the state of am url from its base.
 */
export class Path {
    #internalUrl: URL;

    /**
     * Create path.
     * @param path Pathname.
     */
    constructor(path: string) {
        this.#internalUrl = new URL(`/${trimSlash(path)}`, 'http://local');
    }

    /**
     * Pathname part.
     */
    get pathname(): string {
        return this.#internalUrl.pathname;
    }

    /**
     * Hash part.
     */
    get hash(): string {
        return this.#internalUrl.hash;
    }

    /**
     * Search part.
     */
    get search(): string {
        return this.#internalUrl.search;
    }

    /**
     * Path search params.
     */
    get searchParams(): URLSearchParams {
        return new URLSearchParams(this.#internalUrl.searchParams);
    }

    /**
     * Computed path url.
     */
    get href() {
        return `${this.pathname}${this.search}${this.hash}`;
    }
}
