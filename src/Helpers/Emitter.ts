/**
 * Base Emitter class.
 */
export class Emitter {
    /**
     * Map of listeners.
     */
    #listeners: {
        [key: string]: Function[];
    } = {};

    /**
     * Add listener.
     * @param type The event name.
     * @param listener The listener callback.
     */
    on(type: string, listener: Function) {
        this.#listeners[type] = this.#listeners[type] || [];
        this.#listeners[type].push(listener);
    }

    /**
     * Remove a listener.
     * @param type The event name.
     * @param listener The listener callback to remove.
     */
    off(type: string, listener: Function) {
        const listeners = this.#listeners[type];
        if (!listeners) {
            return;
        }

        const index = listeners.indexOf(listener);
        if (index === -1) {
            return;
        }

        this.#listeners[type].splice(index, 1);
    }

    /**
     * Dispatch an event.
     * @param type The event name.
     * @param data Data to pass to listener.
     * @returns A promise that resolves all listerner invokations.
     */
    trigger<T = {}>(type: string, data?: T) {
        const listeners = this.#listeners[type];
        if (!listeners) {
            return;
        }

        return listeners.reduce((result, listener) => listener.call(this, data, result) ?? result, null);
    }
}
