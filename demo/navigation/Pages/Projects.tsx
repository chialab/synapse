import { type Request, type Response, Route } from '@chialab/synapse';

export class Projects extends Route {
    async exec(request: Request, response: Response) {
        response.setTitle('Projects');
        response.setView(() => 'Projects.');
    }
}
