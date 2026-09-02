import { render } from '@chialab/dna';
import { type App, BrowserHistory } from '@chialab/synapse';
import './App';

const app = render(
    <demo-app
        base={`${window.location.pathname}#!/`}
        history={new BrowserHistory()}
    />,
    document.body
) as App;

app.start();
