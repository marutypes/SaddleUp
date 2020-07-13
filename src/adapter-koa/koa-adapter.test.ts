import Koa, {Context} from 'koa';

import {saddle, unsaddle} from '.';
import '../matchers';
import '../matchers/koa';

describe('saddle/adapter-koa', () => {
  afterAll(() => {
    unsaddle();
  });

  describe('middleware', () => {
    it('can assert on text', async () => {
      async function middleware(ctx: Context, next: any) {
        ctx.body = 'hi hello';
        await next;
      }
      const wrapper = await saddle(middleware);
      const resp = await wrapper.fetch('/');
      await expect(resp).not.toHaveBodyText('hsfasfdasfi hello');
      await expect(resp).toHaveBodyText('hi hello');
      await expect(resp).toHaveStatus(200);
      await expect(resp).toHaveStatusText('OK');
    });

    it('can assert on json', async () => {
      async function middleware(ctx: Context) {
        ctx.body = {foo: ['bar', 'baz'], zip: 'zap'};
      }
      const wrapper = await saddle(middleware);
      const resp = await wrapper.fetch('/');
      await expect(resp).not.toHaveBodyJson({tortelini: 'macaroni'});
      await expect(resp).toHaveBodyJson({foo: ['bar', 'baz']});
    });

    it('can assert on koa state', async () => {
      async function middleware(ctx: Context) {
        ctx.state.testState = 'some content';
      }
      const wrapper = await saddle(middleware);
      const resp = await wrapper.fetch('/');
      await expect(resp).toHaveKoaState({testState: 'some content'});
    });

    it('can set initial state', async () => {
      async function middleware(ctx: Context) {
        ctx.state.visits += 1;
      }
      const wrapper = await saddle(middleware, {state: {visits: 300}});
      const resp = await wrapper.fetch('/');
      await expect(resp).toHaveKoaState({visits: 301});
    });

    it('follows redirects', async () => {
      const middleware = (ctx: Context) => {
        if (ctx.path === '/profile') {
          ctx.redirect('/login');
        }
      };

      const wrapper = await saddle(middleware);
      const resp = await wrapper.fetch('/profile');
      await expect(resp.redirected).toBe(true);
    });
  });

  describe('app', () => {
    it('can assert on text', async () => {
      const app = new Koa();
      app.use((ctx) => {
        ctx.body = 'hi hello';
      });

      const wrapper = await saddle(app);
      const resp = await wrapper.fetch('/');

      await expect(resp).not.toHaveBodyText('hsfasfdasfi hello');
      await expect(resp).toHaveBodyText('hi hello');
      await expect(resp).toHaveStatus(200);
      await expect(resp).toHaveStatusText('OK');
    });

    it('can assert on json', async () => {
      const app = new Koa();
      app.use((ctx) => {
        ctx.body = {foo: ['bar', 'baz'], zip: 'zap'};
      });

      const wrapper = await saddle(app);
      const resp = await wrapper.fetch('/');

      await expect(resp).not.toHaveBodyJson({tortelini: 'macaroni'});
      await expect(resp).toHaveBodyJson({foo: ['bar', 'baz']});
    });

    it('can assert on koa state', async () => {
      const app = new Koa();
      app.use(async (ctx: Context) => {
        ctx.state.testState = 'some content';
      });
      const wrapper = await saddle(app);
      const resp = await wrapper.fetch('/');
      await expect(resp).toHaveKoaState({testState: 'some content'});
    });

    it('follows redirects', async () => {
      const app = new Koa();
      app.use((ctx) => {
        if (ctx.path === '/profile') {
          ctx.redirect('/login');
          return;
        }

        if (ctx.path === '/login') {
          ctx.status = 200;
          ctx.body = 'some login form markup';
        }
      });

      const wrapper = await saddle(app);
      const resp = await wrapper.fetch('/profile');

      await expect(resp.redirected).toBe(true);
      await expect(resp).toHaveBodyText('some login form markup');
      await expect(resp).toHaveStatus(200);
      await expect(resp).toHaveStatusText('OK');
    });
  });
});
