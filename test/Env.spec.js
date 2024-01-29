import { isBrowser, isNode } from '@chialab/synapse';
import { describe, expect, test } from 'vitest';

describe('Env', () => {
    test('should detect browser', () => {
        if (typeof window !== 'undefined') {
            expect(isBrowser()).toBe(true);
            expect(isNode()).toBe(false);
        }
    });

    test('should detect node', () => {
        if (typeof process !== 'undefined') {
            expect(isNode()).toBe(true);
            expect(isBrowser()).toBe(false);
        }
    });
});
