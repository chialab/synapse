import { internal } from '../helpers/internal.js';
import { Plugin } from '../plugin.js';

export const PluggableMixin = (SuperClass) => class extends SuperClass {
    get plugins() {
        return [];
    }

    constructor(...args) {
        super(...args);
        internal(this).plugins = [];
    }

    initialize(config = {}) {
        return super.initialize(config)
            .then(() =>
                this.beforePluginsInitialization(config)
                    .then((plugins) =>
                        this.registerMultiplePlugins(plugins)
                    )
                    .then(() => this.afterPluginsInitialization())
            );
    }

    beforePluginsInitialization(config) {
        let fromCfg = config.plugins || [];
        let fromCtr = this.constructor.plugins || [];
        return Promise.resolve(fromCfg.concat(fromCtr));
    }

    afterPluginsInitialization() {
        return Promise.resolve();
    }

    getPluginInstances() {
        return internal(this.getContext()).plugins;
    }

    registerMultiplePlugins(plugins, conf) {
        let promise = Promise.resolve();
        if (Array.isArray(plugins)) {
            if (plugins.length === 2 &&
                plugins[0].prototype instanceof Plugin &&
                typeof plugins[1] === 'object') {
                promise = this.registerPlugin(plugins[0], plugins[1]);
            } else {
                plugins.forEach((injs) => {
                    promise = promise.then(() => this.registerMultiplePlugins(injs));
                });
            }
        } else {
            promise = this.registerPlugin(plugins, conf);
        }
        return promise;
    }

    registerPlugin(PluginCtr, conf = {}) {
        const plugins = this.getPluginInstances();
        if (PluginCtr instanceof Plugin) {
            plugins.push(PluginCtr);
            this.onPluginReady(PluginCtr);
            return Promise.resolve(PluginCtr);
        } else if (PluginCtr.prototype instanceof Plugin) {
            for (let i = 0, len = plugins.length; i < len; i++) {
                if (plugins[i] instanceof PluginCtr) {
                    return Promise.resolve();
                }
            }
            let depsPromise = Promise.resolve();
            if (Array.isArray(PluginCtr.dependencies)) {
                depsPromise = this.registerMultiplePlugins(PluginCtr.dependencies);
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
