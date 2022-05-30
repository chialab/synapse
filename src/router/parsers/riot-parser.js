/**
 * Extract the pathname from an URL.
 *
 * @param {String} path The path to parse.
 * @return {Array} A list of values for path variables.
 */
export function riotParser(path, filter) {
    filter = filter.replace(/\*/g, '([^/?#]+?)').replace(/\.\./, '(.*)');
    let re = new RegExp(`^${filter}$`);
    let args = path.match(re);
    if (args) {
        return args.slice(1);
    }
    return null;
}
