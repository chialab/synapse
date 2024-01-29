import { html } from '@chialab/dna';
import { getRouter } from '@chialab/synapse';

export function Link({ children, href }, context) {
    const router = getRouter(context);
    const isCurrentPage = href === router?.current;

    return html`<a
        href=${router?.resolve(href)}
        class=${{
            'bg-gray-900': isCurrentPage,
            'text-white': isCurrentPage,
            'text-gray-300': !isCurrentPage,
            'hover:bg-gray-700': !isCurrentPage,
            'hover:text-white': !isCurrentPage,
            'px-3': true,
            'py-2': true,
            'rounded-md': true,
            'text-sm': true,
            'font-medium': true,
        }}
        aria-current=${isCurrentPage ? 'page' : ''}
        >${children}</a
    >`;
}
