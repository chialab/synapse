const DOC = document;

export class CssHelper {
    static add(css, url, id) {
        let style;
        let loadPromise = Promise.resolve();
        id = id || url;
        if (url) {
            style = DOC.createElement('link');
            style.rel = 'stylesheet';
            style.setAttribute('href', url);
            loadPromise = new Promise((resolve, reject) => {
                style.addEventListener('load', () => {
                    resolve();
                });
                style.addEventListener('error', () => {
                    reject();
                });
            });
        } else {
            style = DOC.createElement('style');
            style.type = 'text/css';
            style.textContent = css;
        }
        if (id) {
            style.id = id;
        }
        DOC.head.appendChild(style);
        return loadPromise
            .then(() => Promise.resolve(style));
    }

    static addByContent(content, id) {
        return this.add(content, null, id);
    }

    static addByUrl(url, id) {
        return this.add(null, url, id);
    }
}
