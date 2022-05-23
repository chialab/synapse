import type { PopStateData } from './Router/Router';
import type { Template } from '@chialab/dna';
import { listen } from '@chialab/dna';
import { requestAnimationFrame } from './helpers';
import { Micro } from './Micro';

/**
 * A Web Component which handles routing.
 */
export class App extends Micro {
    /**
     * The number of active animations.
     * Remove the previous Response only when its value is 0.
     */
    private activeAnimations: number = 0;

    /**
     * The previous Router Response render result.
     */
    private previousPage?: Template;

    /**
     * The current Router Response render result.
     */
    protected currentPage?: Template;

    /**
     * @inheritdoc
     */
    forceUpdate() {
        super.forceUpdate();
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                // after 2 raf, we are sure that animations started
                this.removePreviousResponse();
            });
        });
    }

    /**
     * @inheritdoc
     */
    render(): Template {
        return [
            this.previousPage,
            this.currentPage,
        ];
    }

    /**
     * @inheritdoc
     */
    onPopState(data: PopStateData) {
        const { state, previous } = data;
        const previousPage = this.currentPage;
        if (previous && !previous.request.isSubRouteRequest(state.request)) {
            this.previousPage = previousPage;
        }
        this.currentPage = state.response?.render();
        super.onPopState(data);
    }

    /**
     * Remove the previous page if all animations ended.
     */
    private removePreviousResponse() {
        if (this.activeAnimations !== 0) {
            return;
        }
        if (this.previousPage) {
            this.previousPage = undefined;
            this.forceUpdate();
        }
    }

    /**
     * Animation start listener.
     */
    @listen('animationstart')
    protected _onAnimationStart() {
        if (this.currentPage !== this.previousPage) {
            this.activeAnimations++;
        }
    }

    /**
     * Animation end listener.
     */
    @listen('animationend')
    protected _onAnimationEnd() {
        this.activeAnimations--;
        this.removePreviousResponse();
    }
}
