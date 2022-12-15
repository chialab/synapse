import { html } from '@chialab/dna';
import { Route } from '@chialab/synapse';

export class Projects extends Route {
    async exec(request, response) {
        response.setTitle('Projects');

        response.setView(() => html`
            Projects.
        `);
    }
}
