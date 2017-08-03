import { internal } from '../helpers/internal.js';
import { DOM, IDOM } from '@dnajs/idom';

export const RenderMixin = (SuperClass) => class extends SuperClass {
    get root() {
        return DOM.getComponentNode(this.element) || this.element;
    }

    initialize(...args) {
        return super.initialize(...args)
            .then(() => {
                this._setRendering();
                IDOM.patch(this.root, this.render());
                this._unsetRendering();
                return this._rendered();
            });
    }

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
