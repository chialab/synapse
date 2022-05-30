const MANAGER = new WeakMap();

/**
 * @name Mixin
 * @mixin
 */
const mixin = (superClass = class {}) => class extends superClass {
    /**
     * @name on
     * @description
     * Add a callbacks for the specified trigger.
     *
     * @param {*} obj The object that triggers events
     * @param {String} name The event name
     * @param {Function} callback The callback function
     * @return {Function} Destroy created listener with this function
     */
    on(obj, name, callback) {
        if (typeof obj === 'string' && typeof name === 'function') {
            callback = name;
            name = obj;
            obj = this;
        }
        if (typeof callback !== 'function') {
            throw new Error('Callback is not a function.');
        }
        let objCallbacks = MANAGER.get(obj) || {};
        let evtCallbacks = objCallbacks[name] = objCallbacks[name] || { length: 0 };
        let len = evtCallbacks.length;
        evtCallbacks[len] = {
            fn: callback,
            destroy: ((callbacks, evtName, id) =>
                function() {
                    if (typeof callbacks[evtName][id] !== 'undefined') {
                        delete callbacks[evtName][id];
                    }
                }
            )(objCallbacks, name, len),
        };
        evtCallbacks.length += 1;
        MANAGER.set(obj, objCallbacks);
        return objCallbacks[name][len].destroy;
    }
    /**
     * @name off
     * @description
     * Remove all listeners.
     *
     * @param {*} obj The object that triggers events
     * @param {String} name Optional event name to reset
     */
    off(obj, name = null) {
        if (typeof obj === 'string' || typeof obj === 'undefined') {
            name = obj;
            obj = this;
        }
        let callbacks = MANAGER.get(obj);
        if (callbacks) {
            if (name) {
                let clbs = callbacks[name];
                for (let i in clbs) {
                    if (typeof clbs[i] === 'object' && typeof clbs[i].destroy === 'function') {
                        clbs[i].destroy.call(obj);
                    }
                }
            } else {
                for (let k in callbacks) {
                    if (callbacks.hasOwnProperty(k)) {
                        this.off(obj, k);
                    }
                }
            }
        }
    }
    /**
     * @name trigger
     * @description
     * Trigger a callback.
     *
     * @param {*} obj The object that triggers events
     * @param {String} name Event name
     * @param {Array} ...args Arguments to pass to callback functions
     * @exec callback functions
     * @return {Promise}
     */
    trigger(obj, name, ...args) {
        if (typeof obj === 'string') {
            args.unshift(name);
            name = obj;
            obj = this;
        }
        let objCallbacks = MANAGER.get(obj) || {};
        let evtCallbacks = objCallbacks[name] || {};
        let res = [];
        for (let k in evtCallbacks) {
            if (evtCallbacks.hasOwnProperty(k)) {
                let clb = evtCallbacks[k];
                if (typeof clb === 'object' && typeof clb.fn === 'function') {
                    res.push(clb.fn.apply(obj, args));
                }
            }
        }
        return Promise.all(res);
    }
};

/**
 * @class CallbackManager
 * @mixes Mixin
 * @classdesc
 * An instantiable Callback Manager for javascript.
 */
export class CallbackManager extends mixin() {
    static get mixin() {
        return mixin;
    }
}
