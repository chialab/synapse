import { window } from '@chialab/dna';
import { BrowserHistory, History, isNode, Request } from '@chialab/synapse';
import { afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest';

describe('History', () => {
    // eslint-disable-next-line mocha/no-setup-in-describe
    (isNode() ? [History] : [History, BrowserHistory]).forEach((History) => {
        describe(History.name, () => {
            let origin, history;
            beforeAll(() => {
                origin = isNode() ? 'http://localhost/' : `${window.location.origin}/`;
            });

            beforeEach(() => {
                history = new History();
            });

            afterEach(() => {
                history.unlisten?.();
            });

            test('constructor', () => {
                expect(history.states).toHaveLength(0);
                expect(history.index).toBe(-1);
                expect(history.length).toBe(0);
            });

            test('should add state', async () => {
                const request1 = new Request(origin);
                await history.pushState({
                    url: origin,
                    path: '/',
                    title: 'Title',
                    request: request1,
                });

                expect(history.states).toHaveLength(1);
                expect(history.state.url).toBe(origin);
                if (history instanceof BrowserHistory) {
                    expect(window.location.href).toBe(origin);
                }
                expect(history.state.request).toBe(request1);
                expect(history.index).toBe(0);
                expect(history.length).toBe(1);

                const request2 = new Request(`${origin}/2`);
                await history.pushState({
                    url: `${origin}/2`,
                    path: '/2',
                    title: 'Title',
                    request: request2,
                });

                expect(history.states).toHaveLength(2);
                expect(history.state.url).toBe(`${origin}/2`);
                if (history instanceof BrowserHistory) {
                    expect(window.location.href).toBe(`${origin}/2`);
                }
                expect(history.state.request).toBe(request2);
                expect(history.index).toBe(1);
                expect(history.length).toBe(2);
            });

            test('should trigger pushstate event', async () => {
                let currentState, previousState;
                history.on('pushstate', (data) => {
                    currentState = data.state;
                    previousState = data.previous;
                });

                const request1 = new Request(origin);
                await history.pushState({
                    url: origin,
                    path: '/',
                    title: 'Title',
                    request: request1,
                });

                expect(currentState.url).toBe(origin);
                if (history instanceof BrowserHistory) {
                    expect(window.location.href).toBe(origin);
                }
                expect(currentState.request).toBe(request1);

                const request2 = new Request(`${origin}/2`);
                await history.pushState({
                    url: `${origin}/2`,
                    path: '/2',
                    title: 'Title',
                    request: request2,
                });

                expect(previousState.url).toBe(origin);
                expect(previousState.request).toBe(request1);
                expect(currentState.url).toBe(`${origin}/2`);
                if (history instanceof BrowserHistory) {
                    expect(window.location.href).toBe(`${origin}/2`);
                }
                expect(currentState.request).toBe(request2);
            });

            test('should replace state', async () => {
                const request1 = new Request(origin);
                await history.replaceState({
                    url: origin,
                    path: '/',
                    title: 'Title',
                    request: request1,
                });

                expect(history.states).toHaveLength(1);
                expect(history.state.url).toBe(origin);
                if (history instanceof BrowserHistory) {
                    expect(window.location.href).toBe(origin);
                }
                expect(history.state.request).toBe(request1);
                expect(history.index).toBe(0);
                expect(history.length).toBe(1);

                const request2 = new Request(`${origin}/2`);
                await history.replaceState({
                    url: `${origin}/2`,
                    path: '/2',
                    title: 'Title',
                    request: request2,
                });

                expect(history.states).toHaveLength(1);
                expect(history.state.url).toBe(`${origin}/2`);
                if (history instanceof BrowserHistory) {
                    expect(window.location.href).toBe(`${origin}/2`);
                }
                expect(history.state.request).toBe(request2);
                expect(history.index).toBe(0);
                expect(history.length).toBe(1);
            });

            test('should trigger replacestate event', async () => {
                let currentState, previousState;
                history.on('replacestate', (data) => {
                    currentState = data.state;
                    previousState = data.previous;
                });

                const request1 = new Request(origin);
                await history.replaceState({
                    url: origin,
                    path: '/',
                    title: 'Title',
                    request: request1,
                });

                expect(currentState.url).toBe(origin);
                if (history instanceof BrowserHistory) {
                    expect(window.location.href).toBe(origin);
                }
                expect(currentState.request).toBe(request1);

                const request2 = new Request(`${origin}/2`);
                await history.replaceState({
                    url: `${origin}/2`,
                    path: '/2',
                    title: 'Title',
                    request: request2,
                });

                expect(previousState.url).toBe(origin);
                expect(previousState.request).toBe(request1);
                expect(currentState.url).toBe(`${origin}/2`);
                if (history instanceof BrowserHistory) {
                    expect(window.location.href).toBe(`${origin}/2`);
                }
                expect(currentState.request).toBe(request2);
            });

            test('should reset', async () => {
                const request1 = new Request(origin);
                await history.pushState({
                    url: origin,
                    path: '/',
                    title: 'Title',
                    request: request1,
                });

                expect(history.states).toHaveLength(1);
                expect(history.state.url).toBe(origin);
                if (history instanceof BrowserHistory) {
                    expect(window.location.href).toBe(origin);
                }
                expect(history.state.request).toBe(request1);
                expect(history.index).toBe(0);
                expect(history.length).toBe(1);

                history.reset();

                const request2 = new Request(`${origin}/2`);
                await history.pushState({
                    url: `${origin}/2`,
                    path: '/2',
                    title: 'Title',
                    request: request2,
                });

                expect(history.states).toHaveLength(1);
                expect(history.state.url).toBe(`${origin}/2`);
                if (history instanceof BrowserHistory) {
                    expect(window.location.href).toBe(`${origin}/2`);
                }
                expect(history.state.request).toBe(request2);
                expect(history.index).toBe(0);
                expect(history.length).toBe(1);
            });

            test('should navigate history', async () => {
                const request1 = new Request(origin);
                await history.pushState({
                    url: origin,
                    path: '/',
                    title: 'Title',
                    request: request1,
                });

                const request2 = new Request(`${origin}/2`);
                await history.pushState({
                    url: `${origin}/2`,
                    path: '/2',
                    title: 'Title',
                    request: request2,
                });

                const request3 = new Request(`${origin}/3`);
                await history.pushState({
                    url: `${origin}/3`,
                    path: '/3',
                    title: 'Title',
                    request: request3,
                });

                await history.go(-2);

                expect(history.state.url).toBe(origin);
                if (history instanceof BrowserHistory) {
                    expect(window.location.href).toBe(origin);
                }
                expect(history.state.request).toBe(request1);
                expect(history.index).toBe(0);
                expect(history.length).toBe(3);

                await history.forward();

                expect(history.state.url).toBe(`${origin}/2`);
                if (history instanceof BrowserHistory) {
                    expect(window.location.href).toBe(`${origin}/2`);
                }
                expect(history.state.request).toBe(request2);
                expect(history.index).toBe(1);
                expect(history.length).toBe(3);

                await history.forward();

                expect(history.state.url).toBe(`${origin}/3`);
                if (history instanceof BrowserHistory) {
                    expect(window.location.href).toBe(`${origin}/3`);
                }
                expect(history.state.request).toBe(request3);
                expect(history.index).toBe(2);
                expect(history.length).toBe(3);

                await history.back();

                expect(history.state.url).toBe(`${origin}/2`);
                if (history instanceof BrowserHistory) {
                    expect(window.location.href).toBe(`${origin}/2`);
                }
                expect(history.state.request).toBe(request2);
                expect(history.index).toBe(1);
                expect(history.length).toBe(3);

                await history.back();

                expect(history.state.url).toBe(origin);
                if (history instanceof BrowserHistory) {
                    expect(window.location.href).toBe(origin);
                }
                expect(history.state.request).toBe(request1);
                expect(history.index).toBe(0);
                expect(history.length).toBe(3);
            });

            test('should compare states', async () => {
                const state1 = {
                    url: origin,
                    path: '/',
                    title: 'Title',
                    request: new Request(origin),
                };
                await history.pushState(state1);

                const state2 = {
                    url: `${origin}/2`,
                    path: '/2',
                    title: 'Title',
                    request: new Request(`${origin}/2`),
                };
                await history.pushState(state2);

                const state3 = {
                    url: `${origin}/3`,
                    path: '/3',
                    title: 'Title',
                    request: new Request(`${origin}/3`),
                };
                await history.pushState(state3);

                expect(history.compareStates(state2, state1)).toBe('back');
                expect(history.compareStates(state2, state3)).toBe('forward');
            });
        });
    });
});
