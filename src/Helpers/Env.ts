import { window } from '@chialab/dna';

/**
 * Check if the current environment is browser based.
 */
export function isBrowser() {
    return typeof window._jsdom === 'undefined';
}

/**
 * Check if the current environment is node based.
 */
export function isNode() {
    return typeof window._jsdom !== 'undefined';
}
