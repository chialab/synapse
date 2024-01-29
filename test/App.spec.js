import { document, DOM, h, render, window } from '@chialab/dna';
import { Router } from '@chialab/synapse';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { createTestApp, createTestHistory, createTestRouter } from './App.js';

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

    test('should initialize a router', () => {
        const app = render(h(TestApp));

        expect(app.router).toBeInstanceOf(Router);
        expect(app.router.running).toBe(false);
        expect(app.router.base).toBe('/');
    });

    test('should initialize a router with base', () => {
        const app = render(h(TestApp, { base: '/base' }), wrapper);

        expect(app.router).toBeInstanceOf(Router);
        expect(app.router.base).toBe('/base');
        expect(app.router.running).toBe(false);
    });

    test('should update router base on property change', () => {
        const app = render(h(TestApp), wrapper);

        expect(app.router.base).toBe('/');
        render(h(TestApp, { base: '/base' }), wrapper);
        expect(app.router.base).toBe('/base');
    });

    test('should update router origin on property change', () => {
        const app = render(h(TestApp), wrapper);

        expect(app.router.origin).toBe(window.location.origin);
        render(h(TestApp, { origin: 'http://test/' }), wrapper);
        expect(app.router.origin).toBe('http://test');
    });

    test('should autostoart with bool attribute', () => {
        const app = render(h(TestApp, { autostart: true }), wrapper);

        expect(app.router).toBeInstanceOf(Router);
        expect(app.router.running).toBe(true);
    });

    test('should autostoart with string attribute', async () => {
        const app = render(h(TestApp, { autostart: '/' }), wrapper);

        expect(app.router).toBeInstanceOf(Router);
        expect(app.router.running).toBe(true);
        await app.router.waitNavigation();

        expect(app.children[0].tagName).toBe('SPAN');
        expect(app.children[0].textContent).toBe('Home');
    });

    test('should navigate on start', async () => {
        const app = render(h(TestApp), wrapper);

        await app.start('/');

        expect(app.children[0].tagName).toBe('SPAN');
        expect(app.children[0].textContent).toBe('Home');
    });
});
