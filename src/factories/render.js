import { Factory } from '../factory.js';
import { IDOM } from '@dnajs/idom';

export const RENDER_SYMBOL = '__render__owner__';

export class RenderFactory extends Factory {
    renderTo(...args) {
        let owner = this.getOwner();
        self[RENDER_SYMBOL] = owner;
        let res = IDOM.patch(...args);
        delete self[RENDER_SYMBOL];
        return res;
    }
}
