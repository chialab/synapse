export interface EventMap {
    [key: string]: [unknown, unknown];
}

export type Arg<M extends EventMap, K extends keyof M> = M[K][0];

export type Return<M extends EventMap, K extends keyof M> = M[K][1] | null;

export type Listener<M extends EventMap, K extends keyof M> = (arg: Arg<M, K>, res: Return<M, K>) => Return<M, K>;

/**
 * Base Emitter class.
 */
export class Emitter<M extends EventMap = {}> {
    /**
     * Map of listeners.
     */
    #listeners: {
        [K in keyof M]?: Listener<M, K>[];
    } = {};

    /**
     * Add listener.
     * @param type The event name.
     * @param listener The listener callback.
     */
    on<E extends keyof M>(type: E, listener: Listener<M, E>) {
        const listeners = this.#listeners[type] = this.#listeners[type] || [];
        listeners.push(listener);
    }

    /**
     * Remove a listener.
     * @param type The event name.
     * @param listener The listener callback to remove.
     */
    off<E extends keyof M>(type: E, listener: Listener<M, E>) {
        const listeners = this.#listeners[type];
        if (!listeners) {
            return;
        }

        const index = listeners.indexOf(listener);
        if (index === -1) {
            return;
        }

        listeners.splice(index, 1);
    }

    /**
     * Dispatch an event.
     * @param type The event name.
     * @param data Data to pass to listener.
     * @returns A promise that resolves all listerner invokations.
     */
    trigger<E extends keyof M>(type: E, data: Arg<M, E>): Return<M, E> {
        const listeners = this.#listeners[type];
        if (!listeners) {
            return;
        }

        return listeners.reduce((result: Return<M, E>, listener) => listener(data, result) ?? result, null);
    }
}
