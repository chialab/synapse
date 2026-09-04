import type { FunctionComponent } from '@chialab/dna';
import { useRouter } from '@chialab/synapse';

export const Link: FunctionComponent = ({ children, href }) => {
    const router = useRouter();
    const isCurrentPage = href === router?.current;

    return (
        <a
            href={router?.resolve(href)}
            class="app-nav-link"
            aria-current={isCurrentPage ? 'page' : false}>
            {children}
        </a>
    );
};
