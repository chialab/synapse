import { Response } from './Response';

export interface State {
    id: number;
    url: string,
    index: number,
    title: string,
    store: any,
    response?: Response,
}
