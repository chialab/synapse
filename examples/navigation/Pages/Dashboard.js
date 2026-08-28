import { html } from '@chialab/dna';
import { Route } from '@chialab/synapse';

export class Dashboard extends Route {
    async exec(request, response) {
        response.setTitle('Dashboard');
        const { createdAt } = response.getData({
            createdAt: null,
        });
        response.setData({
            pristine: createdAt === null,
            createdAt: createdAt ?? Date.now(),
        });
    }

    view = (request, response) => html`
        <p>This is the dashboard page.</p>
        <p>${response.getData().pristine ? 'This page is newly created ✨' : 'This page has been recycled ♻️'}</p>
    `;
}
