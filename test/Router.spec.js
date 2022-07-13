import { expect } from '@chialab/ginsenghino';
import { Router, History } from '@chialab/synapse';

describe('Router', () => {
    it('should correctly initialize', () => {
        const router = new Router();

        expect(router.origin).to.be.a('string');
        expect(router.base).to.be.equal('/');
    });

    it('should normalize base', () => {
        expect(new Router({ base: '/' }).base).to.be.equal('/');
        expect(new Router({ base: '' }).base).to.be.equal('/');
        expect(new Router({ base: 'base' }).base).to.be.equal('/base');
        expect(new Router({ base: 'base?test' }).base).to.be.equal('/base');
        expect(new Router({ base: 'base/' }).base).to.be.equal('/base');
        expect(new Router({ base: '/base' }).base).to.be.equal('/base');
        expect(new Router({ base: '/base/' }).base).to.be.equal('/base');
    });

    it('should get path from url', () => {
        expect(new Router({ base: '/base' }).pathFromUrl('/base')).to.be.equal('/');
        expect(new Router({ base: '/base' }).pathFromUrl('/base?query')).to.be.equal('/?query');
        expect(new Router({ base: '/base' }).pathFromUrl('/base/')).to.be.equal('/');
        expect(new Router({ base: '/base' }).pathFromUrl('/base/?query')).to.be.equal('/?query');
        expect(new Router({ base: '/base' }).pathFromUrl('/base/path')).to.be.equal('/path');
        expect(new Router({ base: '/base' }).pathFromUrl('/base/path?query')).to.be.equal('/path?query');
        expect(new Router({ base: '/base' }).pathFromUrl('http://local/base')).to.be.equal('/');
        expect(new Router({ base: '/base' }).pathFromUrl('http://local/wrong')).to.be.null;
        expect(new Router({ base: '/base' }).pathFromUrl('http://wrong/base')).to.be.null;
        expect(new Router({ base: '/base' }).pathFromUrl('http://wrong')).to.be.null;
    });

    it('should resolve a path', () => {
        expect(new Router({ base: '/' }).resolve('')).to.be.equal('/');
        expect(new Router({ base: '/' }).resolve('/')).to.be.equal('/');
        expect(new Router({ base: '/' }).resolve('test')).to.be.equal('/test');
        expect(new Router({ base: '/' }).resolve('/test')).to.be.equal('/test');
        expect(new Router({ base: '/' }).resolve('test/')).to.be.equal('/test');
        expect(new Router({ base: '/' }).resolve('/test/')).to.be.equal('/test');
        expect(new Router({ base: '/' }).resolve('//test//')).to.be.equal('/test');
        expect(new Router({ base: '/' }).resolve('/test?query')).to.be.equal('/test?query');
    });

    it('should resolve a full path', () => {
        expect(new Router({ base: '/' }).resolve('', true)).to.be.equal('http://local/');
        expect(new Router({ base: '/' }).resolve('/', true)).to.be.equal('http://local/');
        expect(new Router({ base: '/' }).resolve('test', true)).to.be.equal('http://local/test');
        expect(new Router({ base: '/' }).resolve('/test', true)).to.be.equal('http://local/test');
        expect(new Router({ base: '/' }).resolve('test/', true)).to.be.equal('http://local/test');
        expect(new Router({ base: '/' }).resolve('/test/', true)).to.be.equal('http://local/test');
        expect(new Router({ base: '/' }).resolve('//test//', true)).to.be.equal('http://local/test');
        expect(new Router({ base: '/' }).resolve('/test?query', true)).to.be.equal('http://local/test?query');
    });

    it('should resolve a path with base', () => {
        expect(new Router({ base: '/base' }).resolve('')).to.be.equal('/base');
        expect(new Router({ base: '/base' }).resolve('/')).to.be.equal('/base');
        expect(new Router({ base: '/base' }).resolve('test')).to.be.equal('/base/test');
        expect(new Router({ base: '/base' }).resolve('/test')).to.be.equal('/base/test');
        expect(new Router({ base: '/base' }).resolve('test/')).to.be.equal('/base/test');
        expect(new Router({ base: '/base' }).resolve('/test/')).to.be.equal('/base/test');
        expect(new Router({ base: '/base' }).resolve('//test//')).to.be.equal('/base/test');
        expect(new Router({ base: '/base' }).resolve('/test?query')).to.be.equal('/base/test?query');
    });

    it('should navigate', async () => {
        const history = new History();
        const router = new Router({}, [{
            pattern: '/',
            handler: (req, res) => {
                res.setData(req.url);
            },
        }]);

        await router.start(history);

        const response = await router.navigate('/');
        expect(response.data.href).to.be.equal('http://local/');
        expect(history.entries[0].url).to.be.equal('http://local/');
    });

    it('should navigate (with base)', async () => {
        const history = new History();
        const router = new Router({
            base: '/base',
        }, [{
            pattern: '/',
            handler: (req, res) => {
                res.setData(req.url);
            },
        }]);

        await router.start(history);

        const response = await router.navigate('/');
        expect(response.data.href).to.be.equal('http://local/base');
        expect(history.entries[0].url).to.be.equal('http://local/base');
    });

    describe('patterns', () => {
        let router;
        before(() => {
            router = new Router({
                base: '/base',
            }, [
                {
                    pattern: '/params/:action/:id',
                },
                {
                    pattern: '/params/:id',
                },
                {
                    pattern: '/params',
                },
            ]);
        });

        it('should match empty params', async () => {
            const { request: { params } } = await router.navigate('/params');

            expect(Object.keys(params)).to.have.lengthOf(0);
        });

        it('should match single param', async () => {
            const { request: { params } } = await router.navigate('/params/123');

            expect(Object.keys(params)).to.have.lengthOf(1);
            expect(params.id).to.be.equal('123');
        });

        it('should match single param with query string', async () => {
            const { request: { params } } = await router.navigate('/params/123?test');

            expect(Object.keys(params)).to.have.lengthOf(1);
            expect(params.id).to.be.equal('123');
        });

        it('should match multiple params', async () => {
            const { request: { params } } = await router.navigate('/params/view/123');

            expect(Object.keys(params)).to.have.lengthOf(2);
            expect(params.action).to.be.equal('view');
            expect(params.id).to.be.equal('123');
        });
    });
});
