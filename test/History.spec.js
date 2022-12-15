import { expect } from '@chialab/ginsenghino';
import { window } from '@chialab/dna';
import { History, BrowserHistory, isNode, Request } from '@chialab/synapse';

describe('History', () => {
    // eslint-disable-next-line mocha/no-setup-in-describe
    (isNode() ? [History] : [History, BrowserHistory]).forEach((History) => {
        describe(History.name, () => {
            let origin, history;
            before(() => {
                origin = isNode() ? 'http://localhost/' : `${window.location.origin}/`;
            });

            beforeEach(() => {
                history = new History();
            });

            afterEach(() => {
                history.unlisten?.();
            });

            it('constructor', () => {
                expect(history.states).to.have.lengthOf(0);
                expect(history.index).to.be.equal(-1);
                expect(history.length).to.be.equal(0);
            });

            it('should add state', async () => {
                const request1 = new Request(origin);
                await history.pushState({
                    url: origin,
                    path: '/',
                    title: 'Title',
                    request: request1,
                });

                expect(history.states).to.have.lengthOf(1);
                expect(history.state.url).to.be.equal(origin);
                if (history instanceof BrowserHistory) {
                    expect(window.location.href).to.be.equal(origin);
                }
                expect(history.state.request).to.be.equal(request1);
                expect(history.index).to.be.equal(0);
                expect(history.length).to.be.equal(1);

                const request2 = new Request(`${origin}/2`);
                await history.pushState({
                    url: `${origin}/2`,
                    path: '/2',
                    title: 'Title',
                    request: request2,
                });

                expect(history.states).to.have.lengthOf(2);
                expect(history.state.url).to.be.equal(`${origin}/2`);
                if (history instanceof BrowserHistory) {
                    expect(window.location.href).to.be.equal(`${origin}/2`);
                }
                expect(history.state.request).to.be.equal(request2);
                expect(history.index).to.be.equal(1);
                expect(history.length).to.be.equal(2);
            });

            it('should trigger pushstate event', async () => {
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

                expect(currentState.url).to.be.equal(origin);
                if (history instanceof BrowserHistory) {
                    expect(window.location.href).to.be.equal(origin);
                }
                expect(currentState.request).to.be.equal(request1);

                const request2 = new Request(`${origin}/2`);
                await history.pushState({
                    url: `${origin}/2`,
                    path: '/2',
                    title: 'Title',
                    request: request2,
                });

                expect(previousState.url).to.be.equal(origin);
                expect(previousState.request).to.be.equal(request1);
                expect(currentState.url).to.be.equal(`${origin}/2`);
                if (history instanceof BrowserHistory) {
                    expect(window.location.href).to.be.equal(`${origin}/2`);
                }
                expect(currentState.request).to.be.equal(request2);
            });

            it('should replace state', async () => {
                const request1 = new Request(origin);
                await history.replaceState({
                    url: origin,
                    path: '/',
                    title: 'Title',
                    request: request1,
                });

                expect(history.states).to.have.lengthOf(1);
                expect(history.state.url).to.be.equal(origin);
                if (history instanceof BrowserHistory) {
                    expect(window.location.href).to.be.equal(origin);
                }
                expect(history.state.request).to.be.equal(request1);
                expect(history.index).to.be.equal(0);
                expect(history.length).to.be.equal(1);

                const request2 = new Request(`${origin}/2`);
                await history.replaceState({
                    url: `${origin}/2`,
                    path: '/2',
                    title: 'Title',
                    request: request2,
                });

                expect(history.states).to.have.lengthOf(1);
                expect(history.state.url).to.be.equal(`${origin}/2`);
                if (history instanceof BrowserHistory) {
                    expect(window.location.href).to.be.equal(`${origin}/2`);
                }
                expect(history.state.request).to.be.equal(request2);
                expect(history.index).to.be.equal(0);
                expect(history.length).to.be.equal(1);
            });

            it('should trigger replacestate event', async () => {
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

                expect(currentState.url).to.be.equal(origin);
                if (history instanceof BrowserHistory) {
                    expect(window.location.href).to.be.equal(origin);
                }
                expect(currentState.request).to.be.equal(request1);

                const request2 = new Request(`${origin}/2`);
                await history.replaceState({
                    url: `${origin}/2`,
                    path: '/2',
                    title: 'Title',
                    request: request2,
                });

                expect(previousState.url).to.be.equal(origin);
                expect(previousState.request).to.be.equal(request1);
                expect(currentState.url).to.be.equal(`${origin}/2`);
                if (history instanceof BrowserHistory) {
                    expect(window.location.href).to.be.equal(`${origin}/2`);
                }
                expect(currentState.request).to.be.equal(request2);
            });

            it('should reset', async () => {
                const request1 = new Request(origin);
                await history.pushState({
                    url: origin,
                    path: '/',
                    title: 'Title',
                    request: request1,
                });

                expect(history.states).to.have.lengthOf(1);
                expect(history.state.url).to.be.equal(origin);
                if (history instanceof BrowserHistory) {
                    expect(window.location.href).to.be.equal(origin);
                }
                expect(history.state.request).to.be.equal(request1);
                expect(history.index).to.be.equal(0);
                expect(history.length).to.be.equal(1);

                history.reset();

                const request2 = new Request(`${origin}/2`);
                await history.pushState({
                    url: `${origin}/2`,
                    path: '/2',
                    title: 'Title',
                    request: request2,
                });

                expect(history.states).to.have.lengthOf(1);
                expect(history.state.url).to.be.equal(`${origin}/2`);
                if (history instanceof BrowserHistory) {
                    expect(window.location.href).to.be.equal(`${origin}/2`);
                }
                expect(history.state.request).to.be.equal(request2);
                expect(history.index).to.be.equal(0);
                expect(history.length).to.be.equal(1);
            });

            it('should navigate history', async () => {
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

                expect(history.state.url).to.be.equal(origin);
                if (history instanceof BrowserHistory) {
                    expect(window.location.href).to.be.equal(origin);
                }
                expect(history.state.request).to.be.equal(request1);
                expect(history.index).to.be.equal(0);
                expect(history.length).to.be.equal(3);

                await history.forward();

                expect(history.state.url).to.be.equal(`${origin}/2`);
                if (history instanceof BrowserHistory) {
                    expect(window.location.href).to.be.equal(`${origin}/2`);
                }
                expect(history.state.request).to.be.equal(request2);
                expect(history.index).to.be.equal(1);
                expect(history.length).to.be.equal(3);

                await history.forward();

                expect(history.state.url).to.be.equal(`${origin}/3`);
                if (history instanceof BrowserHistory) {
                    expect(window.location.href).to.be.equal(`${origin}/3`);
                }
                expect(history.state.request).to.be.equal(request3);
                expect(history.index).to.be.equal(2);
                expect(history.length).to.be.equal(3);

                await history.back();

                expect(history.state.url).to.be.equal(`${origin}/2`);
                if (history instanceof BrowserHistory) {
                    expect(window.location.href).to.be.equal(`${origin}/2`);
                }
                expect(history.state.request).to.be.equal(request2);
                expect(history.index).to.be.equal(1);
                expect(history.length).to.be.equal(3);

                await history.back();

                expect(history.state.url).to.be.equal(origin);
                if (history instanceof BrowserHistory) {
                    expect(window.location.href).to.be.equal(origin);
                }
                expect(history.state.request).to.be.equal(request1);
                expect(history.index).to.be.equal(0);
                expect(history.length).to.be.equal(3);
            });

            it('should compare states', async () => {
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

                expect(history.compareStates(state2, state1)).to.be.equal('back');
                expect(history.compareStates(state2, state3)).to.be.equal('forward');
            });
        });
    });
});
