(function() {
    System.config({
        meta: {
            'pouchdb/pouchdb': {
                format: 'global',
                exports: 'PouchDB',
            },
        },
        paths: {
            'loader/text': 'node_modules/systemjs-plugin-text/text.js',
            'chialab/*': 'node_modules/chialab-*',
            'pouchdb/pouchdb': 'node_modules/pouchdb/dist/pouchdb.js',
        },
    });
}());
