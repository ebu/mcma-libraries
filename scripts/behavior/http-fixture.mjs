import { createServer } from 'node:http';
import { once } from 'node:events';

// Loopback only: exercise real HTTP/JSON handling without external services.
export async function serve(t, handler) {
    const requests = [];
    const errors = [];
    const server = createServer(async (request, response) => {
        try {
            let body = '';
            for await (const chunk of request) body += chunk;
            const received = { method: request.method, url: request.url, headers: request.headers, body };
            requests.push(received);
            const result = await handler(received, requests.length);
            response.writeHead(result.status ?? 200, { 'content-type': 'application/json', ...result.headers });
            response.end(typeof result.body === 'string' ? result.body : JSON.stringify(result.body ?? {}));
        } catch (error) {
            errors.push(error);
            response.writeHead(500);
            response.end('fixture handler failed');
        }
    });
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    t.after(async () => {
        server.closeAllConnections();
        await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
        if (errors.length) throw errors[0];
    });
    return { url: `http://127.0.0.1:${server.address().port}`, requests };
}

export const httpConfig = { maxAttempts: 3, retryInterval: 0, axiosConfig: { proxy: false, timeout: 3000 } };
