/**
 * path-to-regexp
 * https://github.com/pillarjs/path-to-regexp
 * @author Blake Embrey (hello@blakeembrey.com)
 * @license MIT
 * Copyright (c) 2014
 */

/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
const PATH_REGEXP = new RegExp([
    // Match escaped characters that would otherwise appear in future matches.
    // This allows the user to escape special characters that won't transform.
    '(\\\\.)',
    // Match Express-style parameters and un-named parameters with a prefix
    // and optional suffixes. Matches appear as:
    //
    // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
    // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
    // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
    //
    // eslint-disable-next-line
    '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?|(\\*))'
].join('|'), 'g');

/**
 * Escape a regular expression string.
 *
 * @param  {string} str
 * @return {string}
 */
function escapeString(str) {
    return str.replace(/([.+*?=^!:${}()[\]|\/\\])/g, '\\$1');
}

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {string} group
 * @return {string}
 */
function escapeGroup(group) {
    return group.replace(/([=!:$\/()])/g, '\\$1');
}

/**
 * Parse a string for the raw tokens.
 *
 * @param  {string} str
 * @return {!Array}
 */
function parse(str) {
    let tokens = [];
    let key = 0;
    let index = 0;
    let path = '';
    let res = PATH_REGEXP.exec(str);

    while (res !== null) {
        let m = res[0];
        let escaped = res[1];
        let offset = res.index;
        path += str.slice(index, offset);
        index = offset + m.length;

        // Ignore already escaped sequences.
        if (escaped) {
            path += escaped[1];
            continue;
        }

        let next = str[index];
        let prefix = res[2];
        let name = res[3];
        let capture = res[4];
        let group = res[5];
        let modifier = res[6];
        let asterisk = res[7];

        // Push the current path onto the tokens.
        if (path) {
            tokens.push(path);
            path = '';
        }

        let partial = prefix !== null && next !== null && next !== prefix;
        let repeat = modifier === '+' || modifier === '*';
        let optional = modifier === '?' || modifier === '*';
        let delimiter = res[2] || '/';
        let pattern = capture || group || (asterisk ? '.*' : `[^${delimiter}]+?`);

        tokens.push({
            name: name || key++,
            prefix: prefix || '',
            delimiter,
            optional,
            repeat,
            partial,
            asterisk: !!asterisk,
            pattern: escapeGroup(pattern),
        });

        res = PATH_REGEXP.exec(str);
    }

    // Match any characters still remaining.
    if (index < str.length) {
        path += str.substr(index);
    }

    // If the path exists, push it onto the end.
    if (path) {
        tokens.push(path);
    }

    return tokens;
}

/**
 * Attach the keys as a property of the regexp.
 *
 * @param  {!RegExp} re
 * @param  {Array}   keys
 * @return {!RegExp}
 */
function attachKeys(re, keys) {
    re.keys = keys;
    return re;
}

/**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {string}
 */
function flags(options) {
    return options.sensitive ? '' : 'i';
}


/**
 * Expose a function for taking tokens and returning a RegExp.
 *
 * @param  {!Array}  tokens
 * @param  {Object=} options
 * @return {!RegExp}
 */
function tokensToRegExp(tokens, options) {
    options = options || {};

    let strict = options.strict;
    let end = options.end !== false;
    let route = '';
    let lastToken = tokens[tokens.length - 1];
    let endsWithSlash = typeof lastToken === 'string' && /\/$/.test(lastToken);

    // Iterate over the tokens and create our regexp string.
    for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i];

        if (typeof token === 'string') {
            route += escapeString(token);
        } else {
            let prefix = escapeString(token.prefix);
            let capture = `(?:${token.pattern})`;

            if (token.repeat) {
                capture += `(?:${prefix}${capture})*`;
            }

            if (token.optional) {
                if (!token.partial) {
                    capture = `(?:${prefix}(${capture}))?`;
                } else {
                    capture = `${prefix}(${capture})?`;
                }
            } else {
                capture = `${prefix}(${capture})`;
            }

            route += capture;
        }
    }

    // In non-strict mode we allow a slash at the end of match. If the path to
    // match already ends with a slash, we remove it for consistency. The slash
    // is valid at the end of a path match, not in the middle. This is important
    // in non-ending mode, where "/test/" shouldn't match "/test//route".
    if (!strict) {
        let cRoute = endsWithSlash ? route.slice(0, -2) : route;
        route = `${cRoute}(?:\\/(?=$))?`;
    }

    if (end) {
        route += '$';
    } else {
        // In non-ending mode, we need the capturing groups to match as much as
        // possible by using a positive lookahead to the end or next path segment.
        route += strict && endsWithSlash ? '' : '(?=\\/|$)';
    }

    return new RegExp(`^${route}`, flags(options));
}

/**
 * Create a path regexp from string input.
 *
 * @param  {string}  path
 * @param  {!Array}  keys
 * @param  {!Object} options
 * @return {!RegExp}
 */
function stringToRegexp(path, keys, options) {
    let tokens = parse(path);
    let re = tokensToRegExp(tokens, options);

    // Attach keys back to the regexp.
    for (let i = 0; i < tokens.length; i++) {
        if (typeof tokens[i] !== 'string') {
            keys.push(tokens[i]);
        }
    }

    return attachKeys(re, keys);
}

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 *
 * @param  {(string|RegExp|Array)} path
 * @param  {(Array|Object)=}       keys
 * @param  {Object=}               options
 * @return {!RegExp}
 */
function pathToRegexp(path, keys, options) {
    keys = keys || [];

    if (!Array.isArray(keys)) {
        options = keys;
        keys = [];
    } else if (!options) {
        options = {};
    }
    return stringToRegexp(path, keys, options);
}

/**
 * Extract the pathname from an URL.
 *
 * @param {String} path The path to parse.
 * @return {Array} A list of values for path variables.
 */
export function expressParser(path, filter) {
    let re = pathToRegexp(filter);
    let matches = re.exec(path);
    if (matches) {
        matches = matches.slice(1);
    }
    return matches;
}
