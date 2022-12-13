import type { State } from './State';
import { window } from '@chialab/dna';
import { History } from './History';

/**
 * Router instances counter.
 */
let instances = 0;

/**
 * History implementation that uses browser window.history.
 */
export class BrowserHistory extends History {
    #id?: string;
    #adapter: typeof window.history;

    constructor(adapter = window.history) {
        super();
        this.#adapter = adapter;
    }

    /**
     * @inheritdoc
     */
    get length() {
        return this.#adapter.length;
    }

    /**
     * @inheritdoc
     */
    start() {
        this.#id = `${Date.now()}-${instances++}`;
        window.addEventListener('popstate', this.onPopState);
    }

    /**
     * @inheritdoc
     */
    end() {
        super.end();
        window.addEventListener('popstate', this.onPopState);
    }

    /**
     * @inheritdoc
     */
    go(shift: number) {
        if (shift === 0) {
            return;
        }
        this._index += shift;
        this.#adapter.go(shift);
    }

    /**
     * @inheritdoc
     */
    back() {
        this.#adapter.back();
    }

    /**
     * @inheritdoc
     */
    forward() {
        this.#adapter.forward();
    }

    /**
     * @inheritdoc
     */
    pushState(stateObj: State, title: string, url: string) {
        const state = super.pushState(stateObj, title, url);
        this.#adapter.pushState({
            id: this.#id,
            title: stateObj.title,
            url: stateObj.url,
            index: this.index,
        }, state.title, state.url);

        return state;
    }

    /**
     * @inheritdoc
     */
    replaceState(stateObj: State, title: string, url: string) {
        const state = super.replaceState(stateObj, title, url);
        this.#adapter.replaceState({
            id: this.#id,
            title: stateObj.title,
            url: stateObj.url,
            index: this.index,
        }, state.title, state.url);

        return state;
    }

    /**
     * The popstate listener.
     * @param event The popstate event.
     */
    private onPopState = (event: PopStateEvent) => {
        const historyState = event.state as unknown as State & { id?: string; index?: number };
        if (historyState &&
            typeof historyState === 'object' &&
            typeof historyState.index === 'number') {
            if (historyState.id !== this.#id) {
                this.end();
                this.start();
                this.pushState(historyState, historyState.title, historyState.url);
            } else {
                const previous = this._entries[this._index]?.state;
                this._index = historyState.index;
                this.trigger('popstate', { state: this._entries[this._index]?.state, previous });
            }
        } else {
            this.pushState(historyState, historyState.title, historyState.url);
        }
    };
}
