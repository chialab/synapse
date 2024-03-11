import { h, render } from '@chialab/dna';
import { dangerouslyEnterRealms } from '@chialab/quantum';
import { Router } from '@chialab/synapse';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { createTestApp, createTestHistory, createTestRouter } from './App.js';

describe('App', () => {
    let router, history, TestApp, wrapper;
    beforeEach(() => {
        history = createTestHistory();
        router = createTestRouter();
        TestApp = createTestApp();
        wrapper = document.createElement('div');
        document.body.appendChild(wrapper);
    });

    afterEach(() => {
        history.unlisten?.();
        wrapper?.remove();
    });

    test('should initialize a router', () => {
        const app = render(h(TestApp.tagName));

        expect(app.router).toBeInstanceOf(Router);
        expect(app.router.running).toBe(false);
        expect(app.router.base).toBe('/');
    });

    test('should initialize a router with base', () => {
        const app = render(h(TestApp.tagName, { base: '/base' }), wrapper);

        expect(app.router).toBeInstanceOf(Router);
        expect(app.router.base).toBe('/base');
        expect(app.router.running).toBe(false);
    });

    test('should update router base on property change', () => {
        const app = render(h(TestApp.tagName), wrapper);

        expect(app.router.base).toBe('/');
        render(h(TestApp.tagName, { base: '/base' }), wrapper);
        expect(app.router.base).toBe('/base');
    });

    test('should update router origin on property change', () => {
        const app = render(h(TestApp.tagName), wrapper);

        expect(app.router.origin).toBe(window.location.origin);
        render(h(TestApp.tagName, { origin: 'http://test/' }), wrapper);
        expect(app.router.origin).toBe('http://test');
    });

    test('should autostoart with bool attribute', () => {
        const app = render(h(TestApp.tagName, { autostart: true }), wrapper);

        expect(app.router).toBeInstanceOf(Router);
        expect(app.router.running).toBe(true);
    });

    test('should autostoart with string attribute', async () => {
        const app = render(
            h(TestApp.tagName, {
                router,
                history,
                autostart: '/',
            }),
            wrapper
        );

        expect(app.router).toBeInstanceOf(Router);
        expect(app.router.running).toBe(true);
        await app.router.waitNavigation();

        dangerouslyEnterRealms(() => {
            expect(app.children[0].tagName).toBe('SPAN');
            expect(app.children[0].textContent).toBe('Home');
        });
    });

    test('should navigate on start', async () => {
        const app = render(
            h(TestApp.tagName, {
                router,
                history,
            }),
            wrapper
        );

        await app.start('/');

        dangerouslyEnterRealms(() => {
            expect(app.children[0].tagName).toBe('SPAN');
            expect(app.children[0].textContent).toBe('Home');
        });
    });
});
