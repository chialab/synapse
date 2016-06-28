import { CallbackManager } from 'chialab/callback-manager/src/callback-manager.js';

let managers = new WeakMap();

export class CallbackHelper {
    static define(obj) {
        managers.set(obj, new CallbackManager());
        if (!obj.prototype.CALLBACK__HELPER__DEFINED) {
            obj.prototype.on = function(...args) {
                let manager = managers.get(this);
                return manager.on(this, ...args);
            };
            obj.prototype.off = function(...args) {
                let manager = managers.get(this);
                return manager.on(this, ...args);
            };
            obj.prototype.trigger = function(...args) {
                let manager = managers.get(this);
                return manager.trigger(this, ...args);
            };
            obj.prototype.CALLBACK__HELPER__DEFINED = true;
        }
    }
}
