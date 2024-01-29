import { cancelAnimationFrame, requestAnimationFrame } from '@chialab/synapse';
import { describe, expect, test, vi } from 'vitest';

describe('Animations', () => {
    test('should tick a request frame', async () => {
        const callback = vi.fn();
        requestAnimationFrame(callback);

        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(callback).toHaveBeenCalledOnce();
    });

    test('should cancel a request frame', async () => {
        const callback = vi.fn();
        const req = requestAnimationFrame(callback);
        cancelAnimationFrame(req);

        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(callback).not.toHaveBeenCalled();
    });
});
