import { expect } from '@chialab/ginsenghino';
import { window, document, render, h, DOM } from '@chialab/dna';
import { getApp, getRouter, loadScript, loadStyleSheet, unloadStyleSheet, isBrowser } from '@chialab/synapse';
import { createTestApp, createTestHistory, createTestRouter } from './App.test.js';

describe('Helpers', () => {
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
            DOM.removeChild(document.body, wrapper);
        });

        describe('getApp', () => {
            it('should get null when not part of app', async () => {
                expect(getApp(DOM.createElement('div'))).to.be.null;
            });

            it('should get the app', async () => {
                const app = render(h(TestApp, { autostart: '/' }), wrapper);
                await app.router.waitNavigation();
                expect(getApp(app.children[0])).to.be.equal(app);
            });

            it('should get self app', async () => {
                const app = render(h(TestApp, { autostart: '/' }), wrapper);
                expect(getApp(app)).to.be.equal(app);
            });
        });

        describe('getRouter', () => {
            it('should get null when not part of app', async () => {
                expect(getRouter(DOM.createElement('div'))).to.be.null;
            });

            it('should get the app router', async () => {
                const app = render(h(TestApp, { autostart: '/' }), wrapper);
                await app.router.waitNavigation();
                expect(getRouter(app.children[0])).to.be.equal(router);
            });
        });
    });

    describe('resources', () => {
        // before(async () => {
        //     if (isNode()) {
        //         const { ResourceLoader } = await import('jsdom');
        //         const { default: utils } = await import('jsdom/lib/jsdom/living/generated/utils.js');

        //         window._jsdom.reconfigure({
        //             url: [...import.meta.url.split('/').slice(0, -1), 'index.html'].join('/'),
        //         });
        //         window._runScripts = 'dangerously';
        //         window._resourceLoader = new ResourceLoader();
        //         utils.implForWrapper(document)._resourceLoader._resourceLoader = window._resourceLoader;
        //     }
        // });

        describe('loadScript', () => {
            it('should load a script', async function() {
                if (isBrowser()) {
                    const url = new URL('./fixtures/script.test.js', import.meta.url);
                    await loadScript(url);

                    expect(globalThis.__TEST_INJECT__).to.be.true;
                    delete globalThis.__TEST_INJECT__;
                } else {
                    this.skip();
                }
            });
        });

        describe('loadStyleSheet', () => {
            it('should load a stylesheet', async function() {
                if (isBrowser()) {
                    const url = new URL('./fixtures/style.css', import.meta.url);
                    expect(window.getComputedStyle(document.body).backgroundColor).to.be.oneOf(['rgba(0, 0, 0, 0)', '']);
                    await loadStyleSheet(url);
                    expect(window.getComputedStyle(document.body).backgroundColor).to.be.oneOf(['rgb(255, 0, 0)']);
                    unloadStyleSheet(url);
                    expect(window.getComputedStyle(document.body).backgroundColor).to.be.oneOf(['rgba(0, 0, 0, 0)', '']);
                } else {
                    this.skip();
                }
            });
        });
    });
});
