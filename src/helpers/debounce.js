export function debounce(callback, wait = 1) {
    return new Promise((resolve) => {
        let res = callback();
        setTimeout(() => {
            resolve(res);
        }, wait);
    });
}
