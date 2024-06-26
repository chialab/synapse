import type { Request } from './Request';
import type { Response } from './Response';

/**
 * The router state representation.
 */
export interface State {
    id: number;
    url: string;
    index: number;
    title: string;
    store: any;
    request: Request;
    response?: Response;
}
