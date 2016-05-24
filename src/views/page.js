export class PageView {
    constructor() {
        let element = document.createElement('section');
        Object.defineProperty(element, 'hide', {
            value: () => {
                element.style.display = 'none';
                return Promise.resolve();
            },
        });
        Object.defineProperty(element, 'show', {
            value: () => {
                element.style.display = 'block';
                return Promise.resolve();
            },
        });
        return element;
    }
}
