import { html } from '@chialab/dna';
import { Route } from '../../../src/index.ts';

export class NotFound extends Route {
    async exec(request, response) {
        response.setTitle('Not found');

        response.setView(() => html` Page not found. `);
    }
}
