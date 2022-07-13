import { expect } from '@chialab/ginsenghino';
import { window, document, customElements, h, render, DOM } from '@chialab/dna';
import { App, Router, History } from '@chialab/synapse';

describe('App', () => {
    let router, history, TestApp, wrapper, count = 1;
    beforeEach(() => {
        history = window.history;
        if (typeof window._jsdom !== 'undefined') {
            window._jsdom.reconfigure({
                url: 'http://localhost/',
            });
            history = new History();
        }
        router = new Router({
            origin: window.location.origin,
            base: '/',
        }, [
            {
                pattern: '/',
                render() {
                    return h('span', {}, 'Home');
                },
            },
        ]);
        TestApp = class extends App {
            history = history;
            router = router;
        };
        customElements.define(`test-app-${count++}`, TestApp);
        wrapper = DOM.createElement('div');
        DOM.appendChild(document.body, wrapper);
    });

    afterEach(() => {
        DOM.removeChild(document.body, wrapper);
        if (typeof window._jsdom !== 'undefined') {
            window._jsdom.reconfigure({
                url: 'about:blank',
            });
        }
    });

    it('should initialize a router', () => {
        const app = render(h(TestApp));

        expect(app.router).to.be.instanceOf(Router);
        expect(app.router.started).to.be.false;
        expect(app.router.base).to.be.equal('/');
    });

    it('should initialize a router with base', () => {
        const app = render(h(TestApp, { base: '/base' }), wrapper);

        expect(app.router).to.be.instanceOf(Router);
        expect(app.router.base).to.be.equal('/base');
        expect(app.router.started).to.be.false;
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
        expect(app.router.started).to.be.true;
    });

    it('should autostoart with string attribute', async () => {
        const app = render(h(TestApp, { autostart: '/' }), wrapper);

        expect(app.router).to.be.instanceOf(Router);
        expect(app.router.started).to.be.true;
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
