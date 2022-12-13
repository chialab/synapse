import type { State } from './State';
import { Emitter } from '../Helpers/Emitter';

export enum NavigationDirection {
    back = 'back',
    forward = 'forward',
}

/**
 * A history state representation.
 */
export interface HistoryState {
    state: State;
    title: string;
    url: string;
    type: 'push' | 'replace';
}

/**
 * Generate a descriptor for a history state.
 *
 * @param state Some properties of the current state.
 * @param title The title for the current state.
 * @param url The current path.
 * @param type The type of the state ('push'|'replace').
 * @returns A descriptor for the history state.
 */
function createState(state: State, title: string, url: string, type: 'push' | 'replace'): HistoryState {
    return {
        state: state || {},
        title,
        url,
        type,
    };
}

/**
 * States collector.
 * An abstraction of the window.history object.
 */
export class History extends Emitter {
    protected _entries: HistoryState[] = [];
    protected _index = -1;

    /**
     * Get history states.
     */
    get states() {
        return this._entries.map((entry) => entry.state);
    }

    /**
     * Get current index.
     */
    get index() {
        return this._index;
    }

    /**
     * Get history length.
     */
    get length() {
        return this._entries.length;
    }

    /**
     * Start listening history changes.
     */
    start() {
        this._entries.splice(0, this._entries.length);
        this._index = -1;
    }

    /**
     * Stop listening history changes.
     */
    end() { }

    /**
     * Move in the history.
     * @param shift The shift movement in the history.
     */
    go(shift: number) {
        if (shift === 0) {
            return;
        }
        const index = this._index + shift;
        if (index < 0 || index >= this._entries.length) {
            return;
        }
        const previous = this._entries[this._index]?.state;
        this._index = index;
        this.trigger('popstate', { state: this._entries[this._index]?.state, previous });
    }

    /**
     * Move back in the history by one entry. Same as `.go(-1)`
     * @returns A promise which resolves the new current state.
     */
    back() {
        return this.go(-1);
    }

    /**
     * Move forward in the history by one entry. Same as `.go(1)`
     * @returns A promise which resolves the new current state.
     */
    forward() {
        return this.go(1);
    }

    /**
     * Add a state to the history.
     * @param stateObj The state properties.
     * @param title The state title.
     * @param url The state path.
     * @returns The new current state.
     */
    pushState(stateObj: State, title: string, url: string) {
        const cloneState = { ...stateObj, index: this._index + 1 };
        const historyState = createState(cloneState, title, url, 'push');
        this._entries = this._entries.slice(0, this._index + 1);
        this._entries.push(historyState);
        const previous = this._entries[this._index]?.state;
        this._index += 1;
        this.trigger('pushstate', { state: this._entries[this._index]?.state, previous });
        return historyState;
    }

    /**
     * Replace the current state of the history.
     *
     * @param stateObj The state properties.
     * @param title The state title.
     * @param url The state path.
     * @returns The new current state.
     */
    replaceState(stateObj: State, title: string, url: string) {
        const cloneState = { ...stateObj, index: this._index };
        const historyState = createState(cloneState, title, url, 'replace');
        const previous = this._entries[this._index]?.state;
        this._index = Math.max(this.index, 0);
        this._entries[this._index] = historyState;
        this.trigger('replacestate', { state: historyState.state, previous });
        return historyState;
    }

    /**
     * Compare tow states position.
     * @param state1 The first state.
     * @param state2 The second state.
     */
    compareStates(state1: State, state2: State) {
        return (state2 as State & { index: number }).index < (state1 as State & { index: number }).index ?
            NavigationDirection.back :
            NavigationDirection.forward;
    }
}
