import {ServerResponse} from 'http';
import createServer, {IncomingMessage} from 'connect';

import {saddle, unsaddle} from '.';
import '../matchers';

describe('saddle/adapter-connect', () => {
  afterAll(() => {
    unsaddle();
  });

  describe('middleware', () => {
    it('can assert on text', async () => {
      async function middleware(_req: IncomingMessage, res: ServerResponse) {
        res.writeHead(200);
        res.end('hi hello');
      }
      const wrapper = await saddle(middleware);
      const resp = await wrapper.fetch('/');
      await expect(resp).not.toHaveBodyText('hsfasfdasfi hello');
      await expect(resp).toHaveBodyText('hi hello');
      await expect(resp).toHaveStatus(200);
      await expect(resp).toHaveStatusText('OK');
    });

    it('can assert on json', async () => {
      async function middleware(_req: IncomingMessage, res: ServerResponse) {
        res.writeHead(200);
        res.end(JSON.stringify({foo: ['bar', 'baz'], zip: 'zap'}));
      }

      const wrapper = await saddle(middleware);
      const resp = await wrapper.fetch('/');
      await expect(resp).not.toHaveBodyJson({tortelini: 'macaroni'});
      await expect(resp).toHaveBodyJson({foo: ['bar', 'baz']});
    });
  });

  describe('app', () => {
    it('can assert on text', async () => {
      const app = createServer();
      app.use(async function middleware(
        _req: IncomingMessage,
        res: ServerResponse,
      ) {
        res.writeHead(200);
        res.end('hi hello');
      });

      const wrapper = await saddle(app);
      const resp = await wrapper.fetch('/');

      await expect(resp).not.toHaveBodyText('hsfasfdasfi hello');
      await expect(resp).toHaveBodyText('hi hello');
      await expect(resp).toHaveStatus(200);
      await expect(resp).toHaveStatusText('OK');
    });

    it('can assert on json', async () => {
      const app = createServer();
      app.use(async function middleware(
        _req: IncomingMessage,
        res: ServerResponse,
      ) {
        res.writeHead(200);
        res.end(JSON.stringify({foo: ['bar', 'baz'], zip: 'zap'}));
      });

      const wrapper = await saddle(app);
      const resp = await wrapper.fetch('/');

      await expect(resp).not.toHaveBodyJson({tortelini: 'macaroni'});
      await expect(resp).toHaveBodyJson({foo: ['bar', 'baz']});
    });
  });
});
