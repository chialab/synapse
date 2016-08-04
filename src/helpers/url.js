const PROTOCOL_REGEX = new RegExp('^(?:[a-z]+:)?//', 'i');
const DOMAIN_REGEX = new RegExp('^(?:[a-z]+:)?//[^/]*', 'i');

export class UrlHelper {
    static join(...paths) {
        let len = paths.length - 1;
        return paths
            .filter((path) => !!path)
            .map((path, index) => {
                if (index === 0) {
                    return path.replace(/\/*$/, '');
                } else if (index === len) {
                    return path.replace(/^\/*/, '');
                }
                return path.replace(/^\/*/, '').replace(/\/*$/, '');
            })
            .join('/');
    }

    static isAbsoluteUrl(url) {
        return PROTOCOL_REGEX.test(url);
    }

    static resolve(base, relative) {
        if (!this.isAbsoluteUrl(base)) {
            throw new Error('base url is not an absolute url');
        }
        if (relative[0] === '/') {
            base = `${base.match(DOMAIN_REGEX)[0]}/`;
        }
        let stack = base.split('/');
        let parts = relative.split('/').filter((part) => part !== '');
        stack.pop();
        for (let i = 0; i < parts.length; i++) {
            if (parts[i] === '.') {
                continue;
            } else if (parts[i] === '..') {
                stack.pop();
            } else {
                stack.push(parts[i]);
            }
        }
        return stack.join('/');
    }
}
