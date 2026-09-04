import { define, type FunctionComponent } from '@chialab/dna';
import { App, DocumentMetaMiddleware, type History, type Router } from '@chialab/synapse';
import { Link } from './Elements/Link';
import { Dashboard } from './Pages/Dashboard';
import { NotFound } from './Pages/NotFound';
import { Projects } from './Pages/Projects';
import { Team } from './Pages/Team';

export const DemoApp = define(
    'demo-app',
    class DemoApp extends App {
        static get routes() {
            return [
                new Dashboard({ pattern: '/' }),
                new Team({ pattern: '/team' }),
                new Projects({ pattern: '/projects' }),
                new NotFound({ pattern: '*' }),
            ];
        }

        static get middlewares() {
            return [new DocumentMetaMiddleware()];
        }

        render() {
            return (
                <div class="app">
                    <BrowserNavigation
                        router={this.router}
                        history={this.history}
                    />
                    <nav class="app-nav">
                        <div class="app-nav-inner">
                            <div class="app-nav-links">
                                <Link href="/">Dashboard</Link>
                                <Link href="/team">Team</Link>
                                <Link href="/projects">Projects</Link>
                            </div>
                        </div>
                    </nav>
                    <main class="app-main">
                        <header class="app-header">
                            <div class="app-header-inner">
                                <h1 class="app-header-title">{this.response?.title}</h1>
                            </div>
                        </header>
                        <div class="app-content">{super.render()}</div>
                    </main>
                </div>
            );
        }
    }
);

const BrowserNavigation: FunctionComponent<{ router?: Router; history: History }> = ({ router, history }) => {
    return (
        <div class="app-history">
            <button
                type="button"
                class="app-history-button"
                disabled={history.index === 0}
                aria-label="Back"
                onclick={() => history.back()}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true">
                    <path
                        fill-rule="evenodd"
                        d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                        clip-rule="evenodd"
                    />
                </svg>
            </button>
            <button
                type="button"
                class="app-history-button"
                disabled={history.index === history.length - 1}
                aria-label="Forward"
                onclick={() => history.forward()}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true">
                    <path
                        fill-rule="evenodd"
                        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                        clip-rule="evenodd"
                    />
                </svg>
            </button>
            <div class="app-history-url">example.com{router?.current ?? '/'}</div>
        </div>
    );
};
