import { html, render } from '@chialab/dna';
import { BrowserHistory } from '../../src/index.ts';
import './App.js';

const app = render(
    html`<demo-app
        base=${`${window.location.pathname}#!/`}
        history=${new BrowserHistory()} />`,
    document.body
);

app.start();
