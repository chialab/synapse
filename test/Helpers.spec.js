import { document, DOM, h, render, window } from '@chialab/dna';
import { getApp, getRouter, isBrowser, loadScript, loadStyleSheet, unloadStyleSheet } from '@chialab/synapse';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { createTestApp, createTestHistory, createTestRouter } from './App.js';

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
            history.unlisten?.();
            DOM.removeChild(document.body, wrapper);
        });

        describe('getApp', () => {
            test('should get null when not part of app', async () => {
                expect(getApp(DOM.createElement('div'))).toBeNull();
            });

            test('should get the app', async () => {
                const app = render(h(TestApp, { autostart: '/' }), wrapper);
                await app.router.waitNavigation();
                expect(getApp(app.children[0])).toBe(app);
            });

            test('should get self app', async () => {
                const app = render(h(TestApp, { autostart: '/' }), wrapper);
                expect(getApp(app)).toBe(app);
            });
        });

        describe('getRouter', () => {
            test('should get null when not part of app', async () => {
                expect(getRouter(DOM.createElement('div'))).toBeNull();
            });

            test('should get the app router', async () => {
                const app = render(h(TestApp, { autostart: '/' }), wrapper);
                await app.router.waitNavigation();
                expect(getRouter(app.children[0])).toBe(router);
            });
        });
    });

    describe('resources', () => {
        describe('loadScript', () => {
            test('should load a script', async () => {
                if (isBrowser()) {
                    const url = new URL('./resources/script.js', import.meta.url);
                    await loadScript(url);

                    expect(globalThis.__TEST_INJECT__).toBe(true);
                    delete globalThis.__TEST_INJECT__;
                }
            });
        });

        describe('loadStyleSheet', () => {
            test('should load a stylesheet', async () => {
                if (isBrowser()) {
                    const url = new URL('./resources/style.css', import.meta.url);
                    expect(window.getComputedStyle(document.body).backgroundColor).to.be.oneOf([
                        'rgba(0, 0, 0, 0)',
                        '',
                    ]);
                    await loadStyleSheet(url);
                    expect(window.getComputedStyle(document.body).backgroundColor).to.be.oneOf(['rgb(255, 0, 0)']);
                    unloadStyleSheet(url);
                    expect(window.getComputedStyle(document.body).backgroundColor).to.be.oneOf([
                        'rgba(0, 0, 0, 0)',
                        '',
                    ]);
                }
            });
        });
    });
});
