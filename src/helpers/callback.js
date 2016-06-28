import { CallbackManager } from 'chialab/callback-manager/src/callback-manager.js';

let managers = new WeakMap();

export class CallbackHelper {
    static define(obj) {
        managers.set(obj, new CallbackManager());
        let proto = obj.constructor &&
            obj.constructor.prototype ||
            Object.getPrototypeOf(obj);
        if (!proto.CALLBACK__HELPER__DEFINED) {
            proto.on = function(...args) {
                let manager = managers.get(this);
                return manager.on(this, ...args);
            };
            proto.off = function(...args) {
                let manager = managers.get(this);
                return manager.on(this, ...args);
            };
            proto.trigger = function(...args) {
                let manager = managers.get(this);
                return manager.trigger(this, ...args);
            };
            proto.CALLBACK__HELPER__DEFINED = true;
        }
    }
}
