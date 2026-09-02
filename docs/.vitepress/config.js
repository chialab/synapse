import { defineConfig } from 'vitepress';
import llmstxt from 'vitepress-plugin-llms';

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: 'Synapse',
    description: 'Client-side routing framework',
    base: '/synapse/',
    outDir: '../public',
    appearance: 'force-auto',

    vite: {
        plugins: [llmstxt()],
    },

    head: [
        ['link', { rel: 'icon', href: '/synapse/favicon.png' }],
        [
            'script',
            {},
            `var _paq = window._paq = window._paq || [];
    /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
    _paq.push(["setDomains", ["*.chialab.github.io/dna","*.chialab.github.io/loock","*.chialab.github.io/rna","*.chialab.github.io/synapse"]]);
    _paq.push(["disableCookies"]);
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);
    (function() {
        var u="https://analytics.chialab.io/";
        _paq.push(['setTrackerUrl', u+'matomo.php']);
        _paq.push(['setSiteId', '2']);
        var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
        g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
    })();`,
        ],
    ],

    themeConfig: {
        logo: '/chialab.svg',

        editLink: {
            pattern: 'https://github.com/chialab/synapse/edit/main/docs/:path',
            text: 'Suggest changes to this page',
        },

        // https://vitepress.dev/reference/default-theme-config
        nav: [
            { text: 'Home', link: '/' },
            { text: 'Guide', link: '/guide/' },
            { text: 'Demo', link: '/guide/demo' },
            {
                text: 'Ecosystem',
                items: [
                    { text: 'DNA', link: 'https://chialab.github.io/dna/' },
                    { text: 'RNA', link: 'https://chialab.github.io/rna/' },
                    { text: 'Loock', link: 'https://chialab.github.io/loock/' },
                    { text: 'Catalog', link: 'https://catalog.chialab.io/' },
                ],
            },
            { text: 'Chialab', link: 'https://www.chialab.it' },
        ],

        sidebar: [
            {
                text: 'Guide',
                items: [
                    { text: 'Get started', link: '/guide/' },
                    { text: 'App', link: '/guide/app' },
                    { text: 'Routing', link: '/guide/router' },
                    { text: 'Request & Response', link: '/guide/request-response' },
                    { text: 'Middleware', link: '/guide/middleware' },
                    { text: 'History', link: '/guide/history' },
                    { text: 'Page & Transition', link: '/guide/components' },
                    { text: 'Hooks', link: '/guide/hooks' },
                ],
            },
        ],

        socialLinks: [{ icon: 'github', link: 'https://github.com/chialab/synapse' }],

        footer: {
            message: 'Client-side routing framework.',
            copyright: '© 2026 Chia Lab Srl. MIT license.',
        },
    },
    lastUpdated: true,
});
