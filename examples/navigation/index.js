import { html, render, document } from '@chialab/dna';
import { BrowserHistory } from '@chialab/synapse';
import './App.js';

const app = render(html`<demo-app
    base="/examples/navigation/#!/"
    history=${new BrowserHistory()}

/>`, document.body);

app.start();
