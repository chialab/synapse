import type { Request } from './Request';
import type { Response } from './Response';

/**
 * The router state representation.
 */
export interface State {
    url: string;
    path: string;
    title: string;
    // biome-ignore lint/suspicious/noExplicitAny: We need to allow any data here
    data: any;
    request: Request;
    response?: Response;
}
