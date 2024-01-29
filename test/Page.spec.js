import { h, render, window } from '@chialab/dna';
import { Page, Response } from '@chialab/synapse';
import { describe, expect, test } from 'vitest';

describe('Page', () => {
    test('render empty response', () => {
        const response = new Response();
        const contents = render(h(Page, { response }));

        expect(contents).toBeInstanceOf(window.Comment);
    });

    test('render textual response', () => {
        const response = new Response();
        response.setView(() => 'test');

        const contents = render(h(Page, { response }));

        expect(contents[0]).toBeInstanceOf(window.Comment);
        expect(contents[1]).toBeInstanceOf(window.Text);
        expect(contents[1].textContent).toBe('test');
    });

    test('render html response', () => {
        const response = new Response();
        response.setView(() => h('span', {}, 'test'));

        const contents = render(h(Page, { response }));

        expect(contents[0]).toBeInstanceOf(window.Comment);
        expect(contents[1].tagName).toBe('SPAN');
        expect(contents[1].textContent).toBe('test');
    });
});
