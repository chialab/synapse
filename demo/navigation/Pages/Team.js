import { html } from '@chialab/dna';
import { Route } from '@chialab/synapse';

export class Team extends Route {
    async exec(request, response) {
        response.setTitle('Team');

        response.setView(
            () =>
                html`<ul class="list-disc">
                    <li>Alan</li>
                    <li>Bart</li>
                    <li>Carl</li>
                    <li>Denis</li>
                </ul>`
        );
    }
}
