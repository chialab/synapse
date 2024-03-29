import { define, html } from '@chialab/dna';
import { App, DocumentMetaMiddleware } from '@chialab/synapse';
import { Link } from './Elements/Link.js';
import { Dashboard } from './Pages/Dashboard.js';
import { NotFound } from './Pages/NotFound.js';
import { Projects } from './Pages/Projects.js';
import { Team } from './Pages/Team.js';

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
            return html`<div class="min-h-full flex flex-col">
            <nav class="bg-gray-800 flex-none">
                <div class="px-4">
                    <div class="flex h-16 items-center justify-between">
                        <div class="flex items-center">
                            <div class="flex items-baseline space-x-4">
                                <${Link} href="/">Dashboard</>
                                <${Link} href="/team">Team</>
                                <${Link} href="/projects">Projects</>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
            <main class="bg-gray-100 flex-auto">
                <header class="bg-white shadow">
                    <div class="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
                        <h1 class="text-3xl font-bold tracking-tight text-gray-900">${this.response?.title}</h1>
                    </div>
                </header>
                <div class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
                    <div class="px-4 py-6 sm:px-0">
                        ${super.render()}
                    </div>
                </div>
            </main>
        </div>`;
        }
    }
);
