import type { State } from './State';
import type { HistoryState } from './History';
import { window } from '@chialab/dna';
import { History, isHistoryState } from './History';

/**
 * Flag listening state for global `popstate` event.
 */
let listening = false;

/**
 * Ensure that the history state con be used as history state.
 * @param state History state object.
 * @returns A history state safe object.
 */
function serializeHistoryState(historyState: HistoryState) {
    return JSON.parse(JSON.stringify(historyState));
}

/**
 * History implementation that uses browser window.history.
 */
export class BrowserHistory extends History {
    #adapter: typeof window.history;
    #currentPopRequest?: { resolve: Function; reject: Function };

    constructor(adapter = window.history) {
        super();
        this.#adapter = adapter;
        this.listen();
    }

    /**
     * Add global `popstate` listener.
     */
    listen() {
        if (listening) {
            throw new Error('You cannot initialize more than one "BrowserHistory".');
        }
        listening = true;
        window.addEventListener('popstate', this.onPopState);
    }

    /**
     * Remove global `popstate` listener.
     */
    unlisten() {
        listening = false;
        window.removeEventListener('popstate', this.onPopState);
    }

    /**
     * @inheritdoc
     */
    async go(shift: number) {
        if (this.#currentPopRequest) {
            this.#currentPopRequest.reject();
        }
        return new Promise<void>((resolve, reject) => {
            this.#currentPopRequest = { resolve, reject };
            this.#adapter.go(shift);
        });
    }

    /**
     * @inheritdoc
     */
    async pushState(state: State) {
        const historyState = await super.pushState(state);
        this.#adapter.pushState(serializeHistoryState(historyState), historyState.title, historyState.url);

        return historyState;
    }

    /**
     * @inheritdoc
     */
    async replaceState(state: State) {
        const historyState = await super.replaceState(state);
        this.#adapter.replaceState(serializeHistoryState(historyState), historyState.title, historyState.url);

        return historyState;
    }

    /**
     * The popstate listener.
     * @param event The popstate event.
     */
    private onPopState = async (event: PopStateEvent) => {
        if (!isHistoryState(event.state)) {
            this.trigger('popstate', {
                url: window.location.href,
            });
            return;
        }
        const previous = this.state;
        if (event.state.historyId !== this._id) {
            this.reset();
            this.trigger('popstate', { state: event.state, previous });
        } else {
            this._index = event.state.index;
            this.trigger('popstate', { state: this.state as State, previous });
        }

        if (this.#currentPopRequest) {
            this.#currentPopRequest.resolve();
        }
        this.#currentPopRequest = undefined;
    };
}
