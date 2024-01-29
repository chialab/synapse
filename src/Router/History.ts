import { Emitter } from '../Helpers/Emitter';
import type { State } from './State';

export enum NavigationDirection {
    back = 'back',
    forward = 'forward',
}

/**
 * A history state representation.
 */
export interface HistoryState {
    historyId: string;
    url: string;
    path: string;
    title: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    index: number;
    type: 'push' | 'replace';
}

/**
 * Check if popstate entry is stateful.
 * @param entry The popstate entry.
 * @returns True if stateful entry.
 */
export function isStateful(
    entry: { state: State | HistoryState; previous?: State } | { url: string }
): entry is { state: State | HistoryState; previous?: State } {
    return 'state' in entry;
}

/**
 * Check if a state is a synapse History state.
 * @param historyState The state to check.
 * @returns True if it is a HistoryState.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isHistoryState(historyState: any): historyState is HistoryState {
    return (
        historyState &&
        typeof historyState === 'object' &&
        typeof historyState.historyId === 'string' &&
        typeof historyState.index === 'number'
    );
}

/**
 * History instances counter.
 */
let instances = 0;

/**
 * States collector.
 * An abstraction of the window.history object.
 */
export class History extends Emitter<{
    pushstate: [{ state: State; previous?: State }, void];
    replacestate: [{ state: State; previous?: State }, void];
    popstate: [{ state: State | HistoryState; previous?: State } | { url: string }, void];
}> {
    protected _entries: HistoryState[] = [];
    protected _map: Map<HistoryState, State> = new Map();
    protected _index = -1;
    protected _id: string;

    constructor() {
        super();
        this._id = `${Date.now()}-${instances++}`;
    }

    /**
     * Get history states.
     */
    get states() {
        return this._entries.map((entry) => this._map.get(entry));
    }

    /**
     * Get current state.
     */
    get state() {
        return this.states[this._index] ?? undefined;
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
    reset() {
        this._id = `${Date.now()}-${instances++}`;
        this._entries.splice(0, this._entries.length);
        this._index = -1;
    }

    /**
     * Move in the history.
     * @param shift The shift movement in the history.
     */
    async go(shift: number) {
        if (shift === 0) {
            return;
        }
        const index = this._index + shift;
        if (index < 0 || index >= this._entries.length) {
            return;
        }
        const previous = this.state;
        this._index = index;
        this.trigger('popstate', { state: this.state as State, previous });
    }

    /**
     * Move back in the history by one entry. Same as `.go(-1)`
     * @returns A promise which resolves the new current state.
     */
    async back() {
        return this.go(-1);
    }

    /**
     * Move forward in the history by one entry. Same as `.go(1)`
     * @returns A promise which resolves the new current state.
     */
    async forward() {
        return this.go(1);
    }

    /**
     * Add a state to the history.
     * @param state The state properties.
     * @returns The new current state.
     */
    async pushState(state: State) {
        const historyState: HistoryState = {
            historyId: this._id,
            url: state.url,
            path: state.path,
            title: state.title,
            data: state.data,
            index: this.index + 1,
            type: 'push',
        };
        this._map.set(historyState, state);
        this._entries = this._entries.slice(0, this._index + 1);
        this._entries.push(historyState);
        const previous = this.state;
        this._index = historyState.index;
        this.trigger('pushstate', { state: this.state as State, previous });
        return historyState;
    }

    /**
     * Replace the current state of the history.
     *
     * @param state The state properties.
     * @returns The new current state.
     */
    async replaceState(state: State) {
        const historyState: HistoryState = {
            historyId: this._id,
            url: state.url,
            path: state.path,
            title: state.title,
            data: state.data,
            index: Math.max(this.index, 0),
            type: 'replace',
        };
        const previous = this.state;
        this._index = historyState.index;
        this._map.set(historyState, state);
        this._entries[this._index] = historyState;
        this.trigger('replacestate', { state: this.state as State, previous });
        return historyState;
    }

    /**
     * Compare tow states position.
     * @param state1 The first state.
     * @param state2 The second state.
     */
    compareStates(state1: State, state2: State) {
        const states = this.states;
        return states.indexOf(state2) < states.indexOf(state1) ? NavigationDirection.back : NavigationDirection.forward;
    }
}
