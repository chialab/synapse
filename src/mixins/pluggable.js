import { Plugin } from '../plugin.js';

export const PluggableMixin = (SuperClass) => class extends SuperClass {
    static get plugins() {
        return [];
    }

    initialize(...args) {
        return super.initialize(...args)
            .then(() => {
                let plugins = this.constructor.plugins;
                let pluginsPromise = Promise.resolve();
                this.plugins = [];
                if (Array.isArray(plugins)) {
                    plugins
                        .filter((PluginCtr) => !!PluginCtr)
                        .forEach((PluginCtr) => {
                            pluginsPromise = pluginsPromise.then(() =>
                                this.registerPlugin(PluginCtr)
                            );
                        });
                }
                return pluginsPromise;
            });
    }

    registerPlugin(PluginCtr, conf = {}) {
        if (Array.isArray(PluginCtr)) {
            return this.registerPlugin(PluginCtr[0], PluginCtr[1]);
        }
        if (PluginCtr.prototype instanceof Plugin) {
            const plugins = this.plugins;
            for (let i = 0, len = plugins.length; i < len; i++) {
                if (plugins[i] instanceof PluginCtr) {
                    return Promise.resolve();
                }
            }
            let depsPromise = Promise.resolve();
            if (Array.isArray(PluginCtr.dependencies)) {
                PluginCtr.dependencies.forEach((DepPlugin) => {
                    depsPromise = depsPromise.then(() => this.registerPlugin(DepPlugin));
                });
            }
            return depsPromise
                .then(() => {
                    let plugin = new PluginCtr(this, conf);
                    plugins.push(plugin);
                    return plugin.ready()
                        .then(() => {
                            this.onPluginReady(plugin);
                            return Promise.resolve();
                        });
                });
        }
        return Promise.resolve();
    }

    onPluginReady() {}
};
