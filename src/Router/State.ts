import type { Request } from './Request';
import type { Response } from './Response';

/**
 * The router state representation.
 */
export interface State {
    url: string;
    path: string;
    title: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    request: Request;
    response?: Response;
}
