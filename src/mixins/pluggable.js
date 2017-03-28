import { internal } from '../helpers/internal.js';
import { Plugin } from '../plugin.js';

export const PluggableMixin = (SuperClass) => class extends SuperClass {
    get plugins() {
        return [];
    }

    initialize(...args) {
        return super.initialize(...args)
            .then(() =>
                this.beforePluginsInitialization()
                    .then(() => {
                        let plugins = this.plugins;
                        let pluginsPromise = Promise.resolve();
                        internal(this).plugins = [];
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
                    })
                    .then(() => this.afterPluginsInitialization())
            );
    }

    beforePluginsInitialization() {
        return Promise.resolve();
    }

    afterPluginsInitialization() {
        return Promise.resolve();
    }

    getPluginInstances() {
        return internal(this).plugins;
    }

    registerPlugin(PluginCtr, conf = {}) {
        if (Array.isArray(PluginCtr)) {
            return this.registerPlugin(PluginCtr[0], PluginCtr[1]);
        }
        if (PluginCtr.prototype instanceof Plugin) {
            const plugins = internal(this).plugins;
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
                .then(() =>
                    PluginCtr.supported()
                        .catch(() => this.onPluginUnsupported(PluginCtr))
                        .then((supported = true) => {
                            if (supported) {
                                return this.initClass(PluginCtr, conf).then((plugin) => {
                                    plugins.push(plugin);
                                    this.onPluginReady(plugin);
                                    return Promise.resolve(plugin);
                                });
                            }
                            return Promise.resolve();
                        })
                );
        }
        return Promise.resolve();
    }

    onPluginReady() {}

    onPluginUnsupported(PluginCtr) {
        // eslint-disable-next-line
        console.warn('Unsupported plugin', PluginCtr);
        return Promise.resolve(false);
    }
};
