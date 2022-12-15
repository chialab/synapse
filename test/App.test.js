import { window, customElements, h } from '@chialab/dna';
import { App, Router, History, BrowserHistory, isNode } from '@chialab/synapse';

let appDelcarations = 1;

export function createTestHistory() {
    if (isNode()) {
        window._jsdom.reconfigure({
            url: 'http://localhost/',
        });
        return new History();
    }

    return new BrowserHistory();
}

export function createTestRouter() {
    return new Router({
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
}

export function createTestApp(history, router) {
    const TestApp = class extends App {
        history = history;
        router = router;
    };
    customElements.define(`test-app-${appDelcarations++}`, TestApp);

    return TestApp;
}
