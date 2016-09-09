export class PageView {
    constructor(view) {
        let element = document.createElement('section');
        element.className = 'page-view';
        Object.defineProperty(element, 'destroy', {
            value: () =>
                view.destroy().then(() => {
                    element.hide().then(() => {
                        if (element && element.parentNode) {
                            element.parentNode.removeChild(element);
                        }
                    });
                    return Promise.resolve();
                })
            ,
        });
        Object.defineProperty(element, 'hide', {
            value: () =>
                new Promise((resolve) => {
                    element.setAttribute('hidden', '');
                    resolve();
                }),
        });
        Object.defineProperty(element, 'show', {
            value: () =>
                new Promise((resolve) => {
                    element.removeAttribute('hidden');
                    resolve();
                }),
        });
        return element;
    }
}
