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

    /**
     * @inheritdoc
     */
    start() {
        super.start();
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
    reset() {
        this.#id = `${Date.now()}-${instances++}`;
        super.reset();
    }

    /**
     * @inheritdoc
     */
    go(shift: number) {
        window.history.go(shift);
    }

    /**
     * @inheritdoc
     */
    back() {
        window.history.back();
    }

    /**
     * @inheritdoc
     */
    forward() {
        window.history.forward();
    }

    /**
     * The popstate listener.
     * @param event The popstate event.
     */
    private onPopState = (event: PopStateEvent) => {
        const state = event.state as unknown as State & { id?: string };
        if (state &&
            typeof state === 'object' &&
            typeof state.index === 'number') {
            if (state.id !== this.#id) {
                this.reset();
            }
        }

        this.pushState(state, state.title, state.url);
    };
}
