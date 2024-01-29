import { document, html, render, window } from '@chialab/dna';
import { BrowserHistory } from '@chialab/synapse';
import './App.js';

const app = render(
    html`<demo-app
        base=${`${window.location.pathname}#!/`}
        history=${new BrowserHistory()} />`,
    document.body
);

app.start();
