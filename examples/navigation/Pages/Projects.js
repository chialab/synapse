import { html } from '@chialab/dna';
import { Route } from '../../../src/index.ts';

export class Projects extends Route {
    async exec(request, response) {
        response.setTitle('Projects');

        response.setView(() => html` Projects. `);
    }
}
