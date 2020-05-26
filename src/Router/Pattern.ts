import { RequestParams } from './Request';

/**
 * The interface of a pattern rule.
 */
export interface PatternRule {
    /**
     * The string pattern to match using Express-style.
     * If not provided, the wildcard '*' will be used.
     */
    pattern?: string;
    /**
     * The priority of the rule.
     * If not provided, it will gain 20 as the default.
     */
    priority?: number;
}

/**
 * A Pattern instance is able to check if the provided pattern matches a path.
 */
export class Pattern {
    /**
     * Convert a pattern string into a Regular Expression.
     * @param pattern The string to conver.
     * @return A RegExp that matches named groups.
     */
    static patternToRegex(pattern: string): [RegExp, string[]] {
        if (pattern === '*') {
            return [/.*/, []];
        }
        let names: string[] = [];
        let chunks = pattern.split('/')
            .map((chunk) => {
                if (chunk.indexOf(':') !== 0) {
                    return chunk.replace(/[\(\)\[\]\{\}\\\-\+\.\*\?\^\$]/g, '\\$0');
                }
                names.push(chunk.substr(1));
                return '([^\\/]+?)';
            })
            .join('\\/');

        let regex = new RegExp(`^${chunks}$`, 'i');
        return [regex, names];
    }

    /**
     * The pattern rule.
     */
    readonly pattern: string;

    /**
     * The pattern priority.
     */
    readonly priority: number;

    /**
     * The RegExp (generated from path) to exec against to path.
     * If it matches, it returns a group of matched values in the path.
     */
    private readonly regex: RegExp;

    /**
     * The list of names for the matched groups.
     */
    private readonly names: string[];

    /**
     * Cache results of regex executions.
     */
    private readonly cache: { [key: string]: RequestParams|false } = {}

    /**
     * Create a Pattern instance.
     * @param rule A PatternRule object.
     */
    constructor(rule: PatternRule) {
        this.pattern = rule.pattern || '*';
        this.priority = typeof rule.priority !== 'undefined' ? rule.priority : 20;
        let [regex, names] = (this.constructor as typeof Pattern).patternToRegex(this.pattern);
        this.regex = regex;
        this.names = names;
    }

    /**
     * Run the regex on the given path.
     * If the regex matches, return grouped values.
     * If the regex does not matches, return false.
     * @param path The path to check.
     * @return False if does not match, grouped values if it does.
     */
    matches(path: string): RequestParams|false {
        if (this.cache[path]) {
            return this.cache[path];
        }
        const match = path.match(this.regex);
        if (!match) {
            this.cache[path] = false;
            return false;
        }
        const params: RequestParams = {};
        this.names.forEach((n, index) => {
            params[n] = match[index + 1];
        });
        this.cache[path] = params;
        return params;
    }
}
