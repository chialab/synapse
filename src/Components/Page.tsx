import type { FunctionComponent } from '@chialab/dna';
import type { Response } from '../Router/Response';

/**
 * Render response.
 * @param data Page data.
 * @returns A template to render the response.
 */
export const Page: FunctionComponent<{ response?: Response }> = function Page({ response }) {
    return response?.render();
};
