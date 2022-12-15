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
    historyId: string;
    state: State;
    title: string;
    url: string;
    index: number;
    type: 'push' | 'replace';
}

/**
 * Describe the change state event data.
 */
export interface HistoryStateChange {
    state: State | null;
    previous: State | null;
}

/**
 * Check if a state is a synapse History state.
 * @param historyState The state to check.
 * @returns True if it is a HistoryState.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isHistoryState(historyState: any): historyState is HistoryState {
    return historyState &&
        typeof historyState === 'object' &&
        typeof historyState.historyId === 'string' &&
        typeof historyState.index === 'number';
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
    'pushstate': [HistoryStateChange, void];
    'replacestate': [HistoryStateChange, void];
    'popstate': [HistoryStateChange, void];
}> {
    protected _entries: HistoryState[] = [];
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
        return this._entries.map((entry) => entry.state);
    }

    /**
     * Get current state.
     */
    get state() {
        return this.states[this._index] ?? null;
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
        this.trigger('popstate', { state: this.state, previous });
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
            index: this.index + 1,
            title: state.title,
            url: state.url,
            state,
            type: 'push',
        };
        this._entries = this._entries.slice(0, this._index + 1);
        this._entries.push(historyState);
        const previous = this.state;
        this._index = historyState.index;
        this.trigger('pushstate', { state: this.state, previous });
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
            index: Math.max(this.index, 0),
            title: state.title,
            url: state.url,
            state,
            type: 'replace',
        };
        const previous = this.state;
        this._index = historyState.index;
        this._entries[this._index] = historyState;
        this.trigger('replacestate', { state: this.state, previous });
        return historyState;
    }

    /**
     * Compare tow states position.
     * @param state1 The first state.
     * @param state2 The second state.
     */
    compareStates(state1: State, state2: State) {
        const states = this.states;
        return states.indexOf(state2) < states.indexOf(state1) ?
            NavigationDirection.back :
            NavigationDirection.forward;
    }
}
