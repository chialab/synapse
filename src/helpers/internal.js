import { Symbolic } from '@chialab/proteins/src/symbolic.js';

const INTERNAL_SYM = Symbolic('internal');

export function internal(object) {
    object[INTERNAL_SYM] = object[INTERNAL_SYM] || {};
    return object[INTERNAL_SYM];
}

internal.destroy = function(object) {
    delete object[INTERNAL_SYM];
};
