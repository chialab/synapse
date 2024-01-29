import { fetch } from '@chialab/synapse';
import { describe, expect, test } from 'vitest';

describe('Network', () => {
    test('should fetch content from url', async () => {
        expect(fetch).toBeTypeOf('function');

        const response = await fetch('https://www.github.com', {
            method: 'HEAD',
            mode: 'no-cors',
        });
        expect(response).not.toBeNull();
        expect(typeof response).toBe('object');
    });
});
