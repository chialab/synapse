import { expect } from '@chialab/ginsenghino';
import { isNode, isBrowser } from '@chialab/synapse';

describe('Env', () => {
    it('should detect browser', function() {
        if (typeof window !== 'undefined') {
            expect(isBrowser()).to.be.true;
            expect(isNode()).to.be.false;
        } else {
            this.skip();
        }
    });

    it('should detect node', function() {
        if (typeof process !== 'undefined') {
            expect(isNode()).to.be.true;
            expect(isBrowser()).to.be.false;
        } else {
            this.skip();
        }
    });
});
