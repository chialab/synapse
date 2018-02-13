import Router from '@chialab/router';
import { internal } from '../helpers/internal.js';
import { IDOM } from '@dnajs/idom';
import { RedirectException } from '../exceptions/redirect.js';

export const ControllerMixin = (SuperClass) => class extends SuperClass {
    getQueryParams() {
        return internal(this);
    }

    setQueryParams(params) {
        internal(this).query = params;
    }

    exec() {
        return Promise.resolve();
    }

    redirect(path) {
        this.getContext().navigate(path);
        return Promise.reject(
            new RedirectException()
        );
    }

    next() {
        return Promise.reject(
            new Router.RouterUnhandledException()
        );
    }
};
