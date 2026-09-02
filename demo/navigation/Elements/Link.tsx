import type { FunctionComponent } from '@chialab/dna';
import { useRouter } from '@chialab/synapse';

export const Link: FunctionComponent = ({ children, href }) => {
    const router = useRouter();
    const isCurrentPage = href === router?.current;

    return (
        <a
            href={router?.resolve(href)}
            class={{
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
            aria-current={isCurrentPage ? 'page' : false}>
            {children}
        </a>
    );
};
