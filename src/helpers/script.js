export class ScriptHelper {
    static add(url, content, type = 'text/javascript') {
        return new Promise((resolve, reject) => {
            let script = document.createElement('script');
            script.type = type;
            if (url) {
                script.src = url;
            } else if (content) {
                script.innerText = content;
            }
            script.addEventListener('load', () => {
                resolve(script);
            });
            script.addEventListener('error', () => {
                reject(script);
            });
            script.addEventListener('abort', () => {
                reject(script);
            });
            document.body.appendChild(script);
        });
    }

    static addByContent(content, type) {
        return this.add(null, content, type);
    }

    static addByUrl(url, type) {
        return this.add(url, null, type);
    }
}
