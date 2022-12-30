import { expect } from '@chialab/ginsenghino';
import { window, document, h, render, DOM } from '@chialab/dna';
import { Router } from '@chialab/synapse';
import { createTestApp, createTestHistory, createTestRouter } from './App.test.js';

describe('App', () => {
    let router, history, TestApp, wrapper;
    beforeEach(() => {
        history = createTestHistory();
        router = createTestRouter();
        TestApp = createTestApp(history, router);
        wrapper = DOM.createElement('div');
        DOM.appendChild(document.body, wrapper);
    });

    afterEach(() => {
        history.unlisten?.();
        DOM.removeChild(document.body, wrapper);
    });

    it('should initialize a router', () => {
        const app = render(h(TestApp));

        expect(app.router).to.be.instanceOf(Router);
        expect(app.router.running).to.be.false;
        expect(app.router.base).to.be.equal('/');
    });

    it('should initialize a router with base', () => {
        const app = render(h(TestApp, { base: '/base' }), wrapper);

        expect(app.router).to.be.instanceOf(Router);
        expect(app.router.base).to.be.equal('/base');
        expect(app.router.running).to.be.false;
    });

    it('should update router base on property change', () => {
        const app = render(h(TestApp), wrapper);

        expect(app.router.base).to.be.equal('/');
        render(h(TestApp, { base: '/base' }), wrapper);
        expect(app.router.base).to.be.equal('/base');
    });

    it('should update router origin on property change', () => {
        const app = render(h(TestApp), wrapper);

        expect(app.router.origin).to.be.equal(window.location.origin);
        render(h(TestApp, { origin: 'http://test/' }), wrapper);
        expect(app.router.origin).to.be.equal('http://test');
    });

    it('should autostoart with bool attribute', () => {
        const app = render(h(TestApp, { autostart: true }), wrapper);

        expect(app.router).to.be.instanceOf(Router);
        expect(app.router.running).to.be.true;
    });

    it('should autostoart with string attribute', async () => {
        const app = render(h(TestApp, { autostart: '/' }), wrapper);

        expect(app.router).to.be.instanceOf(Router);
        expect(app.router.running).to.be.true;
        await app.router.waitNavigation();

        expect(app.children[0].tagName).to.be.equal('SPAN');
        expect(app.children[0].textContent).to.be.equal('Home');
    });

    it('should navigate on start', async () => {
        const app = render(h(TestApp), wrapper);

        await app.start('/');

        expect(app.children[0].tagName).to.be.equal('SPAN');
        expect(app.children[0].textContent).to.be.equal('Home');
    });
});
