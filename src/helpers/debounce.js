export function debounce(callback, wait = 1) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(callback());
        }, wait);
    });
}
