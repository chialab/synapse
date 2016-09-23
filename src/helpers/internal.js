const MAP = new WeakMap();

export function internal(object) {
    if (!MAP.has(object)) {
        MAP.set(object, {});
    }
    return MAP.get(object);
}

internal.destroy = function(object) {
    if (MAP.has(object)) {
        MAP.delete(object);
    }
}
