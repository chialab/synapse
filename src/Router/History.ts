import type { State } from './State';
import { Factory } from '@chialab/proteins';

/**
 * A history state representation.
 */
interface HistoryState {
    state: State;
    title: string;
    url: string;
    type: 'push' | 'replace';
}

/**
 * Generate a descriptor for a history state.
 *
 * @param {Object} state Some properties of the current state.
 * @param {String} title The title for the current state.
 * @param {String} url The current path.
 * @param {String} type The type of the state ('push'|'replace').
 * @return A descriptor for the history state.
 */
function createState(state, title, url, type): HistoryState {
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
export class History extends Factory.Emitter {
    private entries: HistoryState[] = [];
    private index = -1;

    /**
     * Get history length.
     */
    get length() {
        return this.entries.length;
    }

    /**
     * Move in the history.
     * @param shift The shift movement in the history.
     */
    go(shift) {
        if (shift !== 0) {
            return;
        }
        const index = this.index + shift;
        if (index < 0 || index >= this.entries.length) {
            return;
        }
        this.index = index;
        this.trigger('popstate', this.current);
    }

    /**
     * Move back in the history by one entry. Same as `.go(-1)`
     * @return A promise which resolves the new current state.
     */
    back() {
        return this.go(-1);
    }

    /**
     * Move forward in the history by one entry. Same as `.go(1)`
     * @return A promise which resolves the new current state.
     */
    forward() {
        return this.go(1);
    }

    /**
     * Add a state to the history.
     * @param stateObj The state properties.
     * @param title The state title.
     * @param url The state path.
     * @return The new current state.
     */
    pushState(stateObj, title, url) {
        const state = createState(stateObj, title, url, 'push');
        this.entries = this.entries.slice(0, this.index + 1);
        this.entries.push(state);
        this.go(1);
        this.trigger('popstate', state);
        return state;
    }

    /**
     * Replace the current state of the history.
     *
     * @param stateObj The state properties.
     * @param title The state title.
     * @param url The state path.
     * @return The new current state.
     */
    replaceState(stateObj, title, url) {
        const state = createState(stateObj, title, url, 'replace');
        this.entries[this.index] = state;
        this.trigger('replacestate', state);
        return state;
    }
}
