import { type Request, type Response, Route } from '@chialab/synapse';

export class Dashboard extends Route {
    async exec(request: Request, response: Response) {
        const { createdAt } = response.getData({
            createdAt: null,
        });
        response.setTitle('Dashboard');
        response.setData({
            pristine: createdAt === null,
            createdAt: createdAt ?? Date.now(),
        });
    }

    view = (request: Request, response: Response) => (
        <>
            <p>This is the dashboard page.</p>
            <p>{response.getData().pristine ? 'This page is newly created ✨' : 'This page has been recycled ♻️'}</p>
        </>
    );
}
