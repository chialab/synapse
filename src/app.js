import { Router } from 'chialab/router/src/router.js';
import { PagesHelper } from './helpers/pages.js';
import { ViewHelper } from './helpers/view.js';
import { I18NHelper } from './helpers/i18n.js';

export class App {
    constructor(element) {
        if (element) {
            this.bindTo(element);
        }
        this.i18n = new this.constructor.I18NHelper();
        this.pagesDispatcher = new this.constructor.PagesHelper(this.element);
        this.router = new Router(this.routeOptions);
        for (let k in this.routeRoules) {
            if (this.routeRoules.hasOwnProperty(k)) {
                if (typeof this[this.routeRoules[k]] === 'function') {
                    this.router.on(k, this[this.routeRoules[k]].bind(this));
                }
            }
        }
        this.router.start();
    }

    static get ViewHelper() {
        return ViewHelper;
    }

    static get PagesHelper() {
        return PagesHelper;
    }

    static get I18NHelper() {
        return I18NHelper;
    }

    static addStyle(css) {
        let style = document.createElement('style');
        style.type = 'text/css';
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
        document.head.appendChild(style);
    }

    get defaultRouteOptions() {
        return {
            dispatch: true,
        };
    }

    get routeOptions() {
        return this.defaultRouteOptions;
    }

    get routeRoules() {
        return {
            '/*/*/..': 'route',
            '/*/*': 'route',
            '..': 'route',
        };
    }

    get routeMap() {
        return {};
    }

    ready() {
        return Promise.resolve();
    }

    bindTo(element) {
        this.element = element;
    }

    route(controller, action, paths = '') {
        paths = paths.split('/');
        if (controller) {
            let Controller = this.routeMap[controller];
            if (typeof Controller !== 'undefined') {
                let ctr = new Controller(this);
                if (action && typeof ctr[action] === 'function') {
                    ctr[action].call(ctr, ...paths);
                } else {
                    ctr.exec(action, ...paths);
                }
                ctr.ready().then((ctrRes) => {
                    let ViewComponent = ctrRes[0];
                    let vars = ctrRes[1];
                    let content = new ViewComponent(ctr);
                    for (let k in vars) {
                        if (vars.hasOwnProperty(k)) {
                            content[k] = vars[k];
                        }
                    }
                    let oldPage = this.currentPage;
                    let oldContent = this.currentContent;
                    let currentPage = this.currentPage = this.pagesDispatcher.add(content, false);
                    this.currentContent = content;
                    if (oldPage) {
                        oldContent.beforeDetachedCallback();
                        this.pagesDispatcher.remove(oldPage);
                    }
                    this.debounce(currentPage.show.bind(currentPage));
                });
            } else {
                this.notFound();
            }
        }
    }

    debounce(callback) {
        setTimeout(() => {
            callback();
        }, 0);
    }

    navigate(url) {
        this.router.navigate(url);
    }

    notFound() {
        // NOT FOUND
    }

    backState() {
        this.router.back();
    }
}
