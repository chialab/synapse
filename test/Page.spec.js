import { expect } from '@chialab/ginsenghino';
import { h, render, window } from '@chialab/dna';
import { Page, Response } from '@chialab/synapse';

describe('Page', () => {
    it('render empty response', () => {
        const response = new Response();
        const contents = render(h(Page, { response }));

        expect(contents).to.be.instanceOf(window.Comment);
    });

    it('render textual response', () => {
        const response = new Response();
        response.setView(() => 'test');

        const contents = render(h(Page, { response }));

        expect(contents[0]).to.be.instanceOf(window.Comment);
        expect(contents[1]).to.be.instanceOf(window.Text);
        expect(contents[1].textContent).to.be.equal('test');
    });

    it('render html response', () => {
        const response = new Response();
        response.setView(() => h('span', {}, 'test'));

        const contents = render(h(Page, { response }));

        expect(contents[0]).to.be.instanceOf(window.Comment);
        expect(contents[1].tagName).to.be.equal('SPAN');
        expect(contents[1].textContent).to.be.equal('test');
    });
});
