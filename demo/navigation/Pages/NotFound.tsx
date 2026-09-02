import { type Request, type Response, Route } from '@chialab/synapse';

export class NotFound extends Route {
    async exec(request: Request, response: Response) {
        response.setTitle('Not found');
        response.setView(() => 'Page not found.');
    }
}
