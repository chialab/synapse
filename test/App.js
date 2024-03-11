import { define, h } from '@chialab/dna';
import { App, BrowserHistory, Router } from '@chialab/synapse';

let appDelcarations = 1;

export function createTestHistory() {
    return new BrowserHistory();
}

export function createTestRouter() {
    return new Router(
        {
            origin: window.location.origin,
            base: '/',
        },
        [
            {
                pattern: '/',
                render() {
                    return h('span', {}, 'Home');
                },
            },
        ]
    );
}

export function createTestApp() {
    return define(`test-app-${appDelcarations++}`, class extends App {});
}
