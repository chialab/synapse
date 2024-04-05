import { Router } from '@chialab/synapse';
import { beforeAll, describe, expect, test } from 'vitest';

describe('Router', () => {
    test('should correctly initialize', () => {
        const router = new Router();

        expect(router.origin).toBeTypeOf('string');
        expect(router.base).toBe('/');
    });

    test('should normalize base', () => {
        expect(new Router({ origin: 'http://local', base: '/' }).base).toBe('/');
        expect(new Router({ origin: 'http://local', base: '' }).base).toBe('/');
        expect(new Router({ origin: 'http://local', base: 'base' }).base).toBe('/base');
        expect(new Router({ origin: 'http://local', base: 'base?test' }).base).toBe('/base');
        expect(new Router({ origin: 'http://local', base: 'base/' }).base).toBe('/base');
        expect(new Router({ origin: 'http://local', base: '/base' }).base).toBe('/base');
        expect(new Router({ origin: 'http://local', base: '/base/' }).base).toBe('/base');
    });

    test('should get path from url', () => {
        expect(new Router({ origin: 'http://local', base: '/base' }).pathFromUrl('/base')).toBe('/');
        expect(new Router({ origin: 'http://local', base: '/base' }).pathFromUrl('/base?query')).toBe('/?query');
        expect(new Router({ origin: 'http://local', base: '/base' }).pathFromUrl('/base/')).toBe('/');
        expect(new Router({ origin: 'http://local', base: '/base' }).pathFromUrl('/base/?query')).toBe('/?query');
        expect(new Router({ origin: 'http://local', base: '/base' }).pathFromUrl('/base/path')).toBe('/path');
        expect(new Router({ origin: 'http://local', base: '/base' }).pathFromUrl('/base/path?query')).toBe(
            '/path?query'
        );
        expect(new Router({ origin: 'http://local', base: '/base' }).pathFromUrl('http://local/base')).toBe('/');
        expect(new Router({ origin: 'http://local', base: '/base' }).pathFromUrl('http://local/wrong')).toBeNull();
        expect(new Router({ origin: 'http://local', base: '/base' }).pathFromUrl('http://wrong/base')).toBeNull();
        expect(new Router({ origin: 'http://local', base: '/base' }).pathFromUrl('http://wrong')).toBeNull();
    });

    test('should resolve a path', () => {
        expect(new Router({ origin: 'http://local', base: '/' }).resolve('')).toBe('/');
        expect(new Router({ origin: 'http://local', base: '/' }).resolve('/')).toBe('/');
        expect(new Router({ origin: 'http://local', base: '/' }).resolve('test')).toBe('/test');
        expect(new Router({ origin: 'http://local', base: '/' }).resolve('/test')).toBe('/test');
        expect(new Router({ origin: 'http://local', base: '/' }).resolve('test/')).toBe('/test');
        expect(new Router({ origin: 'http://local', base: '/' }).resolve('/test/')).toBe('/test');
        expect(new Router({ origin: 'http://local', base: '/' }).resolve('//test//')).toBe('/test');
        expect(new Router({ origin: 'http://local', base: '/' }).resolve('/test?query')).toBe('/test?query');
    });

    test('should resolve a full path', () => {
        expect(new Router({ origin: 'http://local', base: '/' }).resolve('', true)).toBe('http://local/');
        expect(new Router({ origin: 'http://local', base: '/' }).resolve('/', true)).toBe('http://local/');
        expect(new Router({ origin: 'http://local', base: '/' }).resolve('test', true)).toBe('http://local/test');
        expect(new Router({ origin: 'http://local', base: '/' }).resolve('/test', true)).toBe('http://local/test');
        expect(new Router({ origin: 'http://local', base: '/' }).resolve('test/', true)).toBe('http://local/test');
        expect(new Router({ origin: 'http://local', base: '/' }).resolve('/test/', true)).toBe('http://local/test');
        expect(new Router({ origin: 'http://local', base: '/' }).resolve('//test//', true)).toBe('http://local/test');
        expect(new Router({ origin: 'http://local', base: '/' }).resolve('/test?query', true)).toBe(
            'http://local/test?query'
        );
    });

    test('should resolve a path with base', () => {
        expect(new Router({ origin: 'http://local', base: '/base' }).resolve('')).toBe('/base');
        expect(new Router({ origin: 'http://local', base: '/base' }).resolve('/')).toBe('/base');
        expect(new Router({ origin: 'http://local', base: '/base' }).resolve('test')).toBe('/base/test');
        expect(new Router({ origin: 'http://local', base: '/base' }).resolve('/test')).toBe('/base/test');
        expect(new Router({ origin: 'http://local', base: '/base' }).resolve('test/')).toBe('/base/test');
        expect(new Router({ origin: 'http://local', base: '/base' }).resolve('/test/')).toBe('/base/test');
        expect(new Router({ origin: 'http://local', base: '/base' }).resolve('//test//')).toBe('/base/test');
        expect(new Router({ origin: 'http://local', base: '/base' }).resolve('/test?query')).toBe('/base/test?query');
    });

    test('should resolve a path with base hash', () => {
        expect(new Router({ origin: 'http://local', base: '/base#' }).resolve('')).toBe('/base#');
        expect(new Router({ origin: 'http://local', base: '/base#' }).resolve('/')).toBe('/base#');
        expect(new Router({ origin: 'http://local', base: '/base#' }).resolve('test')).toBe('/base#/test');
        expect(new Router({ origin: 'http://local', base: '/base#' }).resolve('/test')).toBe('/base#/test');
        expect(new Router({ origin: 'http://local', base: '/base#' }).resolve('test/')).toBe('/base#/test');
        expect(new Router({ origin: 'http://local', base: '/base#' }).resolve('/test/')).toBe('/base#/test');
        expect(new Router({ origin: 'http://local', base: '/base#' }).resolve('//test//')).toBe('/base#/test');
        expect(new Router({ origin: 'http://local', base: '/base#' }).resolve('/test?query')).toBe('/base#/test?query');
    });

    test('should navigate', async () => {
        const router = new Router(
            {
                origin: 'http://local',
            },
            [
                {
                    pattern: '/test',
                    handler: (req, res) => {
                        res.setData(req.url);
                    },
                },
            ]
        );

        await router.start();

        const response = await router.navigate('/test?test=1');
        expect(response.request.path.searchParams.get('test')).toBe('1');
        expect(response.data.href).toBe('http://local/test?test=1');
        expect(router.history.states[1].url).toBe('http://local/test?test=1');
    });

    test('should navigate with base', async () => {
        const router = new Router(
            {
                origin: 'http://local',
                base: '/base',
            },
            [
                {
                    pattern: '/test',
                    handler: (req, res) => {
                        res.setData(req.url);
                    },
                },
            ]
        );

        await router.start();

        const response = await router.navigate('/test');
        expect(response.data.href).toBe('http://local/base/test');
        expect(router.history.states[1].url).toBe('http://local/base/test');
    });

    test('should navigate with hashbang base', async () => {
        const router = new Router(
            {
                origin: 'http://local',
                base: '/#!/',
            },
            [
                {
                    pattern: '/test',
                    handler: (req, res) => {
                        res.setData(req.url);
                    },
                },
            ]
        );

        await router.start();

        const response = await router.navigate('/test?test=1');
        expect(response.request.path.searchParams.get('test')).toBe('1');
        expect(response.data.href).toBe('http://local/#!/test?test=1');
        expect(router.history.states[1].url).toBe('http://local/#!/test?test=1');
    });

    test('should navigate with hash', async () => {
        const router = new Router(
            {
                origin: 'http://local',
            },
            [
                {
                    pattern: '/test',
                    handler: (req, res) => {
                        res.setData(req.url);
                    },
                },
            ]
        );

        await router.start();

        const response = await router.navigate('/test');
        expect(response.data.href).toBe('http://local/test');
        expect(router.history.states[1].url).toBe('http://local/test');
        const response2 = await router.navigate('/test#test');
        expect(response2.data.href).toBe('http://local/test#test');
        expect(router.history.states[2].url).toBe('http://local/test#test');
    });

    describe('patterns', () => {
        let router;
        beforeAll(() => {
            router = new Router(
                {
                    base: '/base',
                },
                [
                    {
                        pattern: '/params/:action/:id',
                    },
                    {
                        pattern: '/params/:id',
                    },
                    {
                        pattern: '/params',
                    },
                ]
            );
        });

        test('should match empty params', async () => {
            const {
                request: { params },
            } = await router.navigate('/params');

            expect(Object.keys(params)).toHaveLength(0);
        });

        test('should match single param', async () => {
            const {
                request: { params },
            } = await router.navigate('/params/123');

            expect(Object.keys(params)).toHaveLength(1);
            expect(params.id).toBe('123');
        });

        test('should match single param with query string', async () => {
            const {
                request: { params },
            } = await router.navigate('/params/123?test');

            expect(Object.keys(params)).toHaveLength(1);
            expect(params.id).toBe('123');
        });

        test('should match multiple params', async () => {
            const {
                request: { params },
            } = await router.navigate('/params/view/123');

            expect(Object.keys(params)).toHaveLength(2);
            expect(params.action).toBe('view');
            expect(params.id).toBe('123');
        });
    });
});
