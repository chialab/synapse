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
                <div class="min-h-full flex flex-col">
                    <BrowserNavigation
                        router={this.router}
                        history={this.history}
                    />
                    <nav class="bg-gray-800 flex-none">
                        <div class="px-4">
                            <div class="flex h-16 items-center justify-between">
                                <div class="flex items-center">
                                    <div class="flex items-baseline space-x-4">
                                        <Link href="/">Dashboard</Link>
                                        <Link href="/team">Team</Link>
                                        <Link href="/projects">Projects</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </nav>
                    <main class="bg-gray-100 flex-auto">
                        <header class="bg-white shadow">
                            <div class="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
                                <h1 class="text-3xl font-bold tracking-tight text-gray-900">{this.response?.title}</h1>
                            </div>
                        </header>
                        <div class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
                            <div class="px-4 sm:px-0">{super.render()}</div>
                        </div>
                    </main>
                </div>
            );
        }
    }
);

const BrowserNavigation: FunctionComponent<{ router?: Router; history: History }> = ({ router, history }) => {
    return (
        <div class="bg-gray-100 flex-none flex items-center gap-2 px-3 py-2">
            <button
                type="button"
                class="w-6 h-6 flex-none flex items-center justify-center rounded-full bg-white text-gray-600 shadow disabled:opacity-30"
                disabled={history.index === 0}
                aria-label="Back"
                onclick={() => history.back()}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                    class="w-4 h-4">
                    <path
                        fill-rule="evenodd"
                        d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                        clip-rule="evenodd"
                    />
                </svg>
            </button>
            <button
                type="button"
                class="w-6 h-6 flex-none flex items-center justify-center rounded-full bg-white text-gray-600 shadow disabled:opacity-30"
                disabled={history.index === history.length - 1}
                aria-label="Forward"
                onclick={() => history.forward()}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                    class="w-4 h-4">
                    <path
                        fill-rule="evenodd"
                        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                        clip-rule="evenodd"
                    />
                </svg>
            </button>
            <div class="flex-auto bg-white border border-gray-300 rounded-full px-4 py-1 text-xs font-mono text-gray-500 truncate">
                example.com{router?.current ?? '/'}
            </div>
        </div>
    );
};
