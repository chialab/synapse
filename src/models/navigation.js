export class NavigationEntry {
    constructor(previous) {
        if (previous) {
            previous.resolver();
            this.previous = previous.promise;
        } else {
            this.previous = Promise.resolve();
        }
        this.promise = new Promise((resolve) => {
            this.resolver = resolve;
        });

        this.promise
            .then(() => {
                this.resolved = true;
            });
    }

    run(callback) {
        return new Promise((resolve, reject) => {
            this.previous
                .then(() => {
                    callback(this).then(resolve, reject);
                });
        });
    }
}
