import Koa from 'koa';

import {saddle, unsaddle} from '.';
import '../matchers';
import '../matchers/koa';

describe('saddle', () => {
  afterAll(() => {
    unsaddle();
  });

  describe('middleware', () => {
    it('can assert on text', async () => {
      async function middleware(ctx: any, next: any) {
        ctx.body = 'hi hello';
        await next;
      }
      const wrapper = await saddle(middleware);
      const [resp] = await wrapper.fetch('/');
      expect(resp).not.toHaveBodyText('hsfasfdasfi hello');
      expect(resp).toHaveBodyText('hi hello');
      expect(resp).toHaveStatus(200);
      expect(resp).toHaveStatusText('OK');
    });

    it('can assert on json', async () => {
      async function middleware(ctx: any) {
        ctx.body = {foo: ['bar', 'baz'], zip: 'zap'};
      }
      const wrapper = await saddle(middleware);
      const [resp] = await wrapper.fetch('/');
      await expect(resp).not.toHaveBodyJson({tortelini: 'macaroni'});
      await expect(resp).toHaveBodyJson({foo: ['bar', 'baz']});
    });

    it('can assert on koa state', async () => {
      async function middleware(ctx: any) {
        ctx.state.testState = 'some content';
      }
      const wrapper = await saddle(middleware);
      const [, ctx] = await wrapper.fetch('/');
      await expect(ctx).toHaveKoaState({testState: 'some content'});
    });

    it('can set initial state', async () => {
      async function middleware(ctx: any) {
        ctx.state.visits += 1;
      }
      const wrapper = await saddle(middleware, {state: {visits: 300}});
      const [, ctx] = await wrapper.fetch('/');
      await expect(ctx).toHaveKoaState({visits: 301});
    });
  });

  describe('app', () => {
    it('can assert on text', async () => {
      const app = new Koa();
      app.use((ctx) => {
        ctx.body = 'hi hello';
      });

      const wrapper = await saddle(app);
      const [resp, ctx] = await wrapper.fetch('/');

      expect(resp).not.toHaveBodyText('hsfasfdasfi hello');
      expect(resp).toHaveBodyText('hi hello');
      expect(resp).toHaveStatus(200);
      expect(resp).toHaveStatusText('OK');
      expect(ctx.status).toBe(200);
      expect(ctx.body).toBe('hi hello');
    });

    it('can assert on json', async () => {
      const app = new Koa();
      app.use((ctx) => {
        ctx.body = {foo: ['bar', 'baz'], zip: 'zap'};
      });

      const wrapper = await saddle(app);
      const [resp] = await wrapper.fetch('/');

      await expect(resp).not.toHaveBodyJson({tortelini: 'macaroni'});
      await expect(resp).toHaveBodyJson({foo: ['bar', 'baz']});
    });
  });
});
