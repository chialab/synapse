import { type Request, type Response, Route } from '@chialab/synapse';

export class Team extends Route {
    async exec(request: Request, response: Response) {
        response.setTitle('Team');
        response.setView(() => (
            <ul class="list">
                <li>Alan</li>
                <li>Bart</li>
                <li>Carl</li>
                <li>Denis</li>
            </ul>
        ));
    }
}
