export class ScriptHelper {
    static addByUrl(url) {
        return new Promise((resolve, reject) => {
            let script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = url;
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
}
