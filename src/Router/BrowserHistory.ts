import { History, isHistoryState, type HistoryState } from './History';
import type { State } from './State';

/**
 * The active browser history instance.
 */
let listening: BrowserHistory | false = false;

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
    }

    /**
     * @inheritdoc
     */
    start() {
        if (listening && listening !== this) {
            throw new Error('You cannot initialize more than one "BrowserHistory".');
        }
        if (this.active) {
            return;
        }
        super.start();
        listening = this;
        window.addEventListener('popstate', this.onPopState);
    }

    /**
     * @inheritdoc
     */
    stop() {
        if (!this.active) {
            return;
        }
        super.stop();
        listening = false;
        window.removeEventListener('popstate', this.onPopState);
    }

    /**
     * Add global `popstate` listener.
     * @deprecated Use `start` instead.
     */
    listen() {
        return this.start();
    }

    /**
     * Remove global `popstate` listener.
     * @deprecated Use `stop` instead.
     */
    unlisten() {
        return this.stop();
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
