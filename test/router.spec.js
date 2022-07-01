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

    it('should start with a history', async () => {
        const history = new History();
        const router = new Router();

        expect(await router.start(history, false)).to.be.undefined;
    });

    it('should navigate', async () => {
        const history = new History();
        const router = new Router({}, [{
            pattern: '/',
            handler: (req, res) => {
                res.setData(req.url);
            },
        }]);

        await router.start(history, false);

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

        await router.start(history, false);

        const response = await router.navigate('/');
        expect(response.data.href).to.be.equal('http://local/base');
        expect(history.entries[0].url).to.be.equal('http://local/base');
    });
});
