(function() {
    System.config({
        meta: {
            pouchdb: {
                format: 'global',
                exports: 'PouchDB',
            },
        },
        paths: {
            'chialab/*': 'node_modules/chialab-*',
            'pouchdb': 'node_modules/pouchdb/dist/pouchdb.js',
        },
    });
}());
