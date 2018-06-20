import { internal } from '../helpers/internal.js';
import { DOM, IDOM } from '@dnajs/idom';

export const RenderMixin = (SuperClass) => class extends SuperClass {
    /**
     * The root node element of the App.
     * @type {Element}
     */
    get root() {
        return DOM.getComponentNode(this.element) || this.element;
    }

    /**
     * @inheritdoc
     */
    initialize(...args) {
        return super.initialize(...args)
            .then(() => this._render());
    }

    /**
     * Update App rendering.
     * @private
     *
     * @return {Promise}
     */
    _render() {
        this._setRendering();
        const content = this.render();
        const root = this.root;
        if (typeof content === 'string') {
            root.innerHTML = content;
        } else {
            IDOM.patch(root, content);
        }
        this._unsetRendering();
        return this._rendered();
    }

    /**
     * The render template.
     *
     * @return {Function} The JSX template of the App.
     */
    render() { }

    /**
     * Set the application in rendering mode.
     * @private
     */
    _setRendering() {
        internal(this).rendering = true;
        internal(this).renderingPromises = [];
    }

    /**
     * Unset the application from rendering mode.
     * @private
     */
    _unsetRendering() {
        internal(this).rendering = false;
    }

    /**
     * Add a rendering promise.
     * @private
     *
     * @param {Promise} rendering The promise to add to rendering queue.
     */
    _addRendering(rendering) {
        internal(this).renderingPromises.push(rendering);
    }

    /**
     * Check if app is in rendering mode.
     * @private
     *
     * @return {Boolean}
     */
    _isRendering() {
        return !!internal(this).rendering;
    }

    /**
     * Return the rendering resolution queue.
     * @private
     *
     * @return {Promise} Resolves when all rendering promieses are resolved.
     */
    _rendered() {
        return Promise.all(internal(this).renderingPromises);
    }
};
