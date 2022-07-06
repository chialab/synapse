import { expect, spy, wait } from '@chialab/ginsenghino';
import { requestAnimationFrame, cancelAnimationFrame } from '@chialab/synapse';

describe('Animations', () => {
    it('should tick a request frame', async () => {
        const callback = spy();
        requestAnimationFrame(callback);

        await wait(100);

        expect(callback).to.be.called.once;
    });

    it('should cancel a request frame', async () => {
        const callback = spy();
        const req = requestAnimationFrame(callback);
        cancelAnimationFrame(req);

        await wait(100);

        expect(callback).to.not.be.called();
    });
});
