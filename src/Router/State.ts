import { Response } from './Response';

/**
 * The router state representation.
 */
export interface State {
    id: number;
    url: string;
    index: number;
    title: string;
    store: any;
    response?: Response;
}
