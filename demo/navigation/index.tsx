import { render } from '@chialab/dna';
import { type App, BrowserHistory, History } from '@chialab/synapse';
import './App';
import './style.css';

const isEmbedded = window.location.href === 'about:srcdoc';
const app = render(
    <demo-app
        base={`${window.location.pathname}#!/`}
        history={isEmbedded ? new History() : new BrowserHistory()}
    />,
    document.body
) as App;

app.start();
