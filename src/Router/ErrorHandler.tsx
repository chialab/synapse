import type { Router } from './Router';
import type { Request } from './Request';
import type { View } from './Response';
import { Response } from './Response';

export type ErrorHandler = (request: Request, error: Error, router: Router) => Response|View;

function formatStack(error: Error) {
    if (!error.stack) {
        return;
    }
    return <p>
        {error.stack.split(/^(.*)$/gm).map((line) => <div>{line}</div>)}
    </p>;
}

/**
 * The default error handler.
 * @param request The request of the routing.
 * @param error The thrown error.
 * @returns An error response object.
 */
export default function(request: Request, error: Error) {
    const response = new Response(request);
    response.setTitle(error.message);
    response.setView(() => <div>
        <details>
            <summary style="color: red">{error.message}</summary>
            {formatStack(error)}
        </details>
    </div>);
    return response;
}
