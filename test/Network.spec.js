import { expect } from '@chialab/ginsenghino';
import { fetch } from '@chialab/synapse';

describe('Network', () => {
    it('should fetch content from url', async () => {
        expect(fetch).to.be.a('function');

        const response = await fetch('http://www.example.com');
        expect(response).to.not.be.null;
        expect(typeof response).to.be.equal('object');
    });
});
