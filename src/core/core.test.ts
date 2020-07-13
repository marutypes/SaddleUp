import {createServer} from 'http';
import {saddle, unsaddle} from '.';
import '../matchers';

describe('saddle', () => {
  afterAll(() => {
    unsaddle();
  });

  it('can assert against the response', async () => {
    const server = createServer((_req, res) => {
      res.writeHead(200);
      res.end('hi hello');
    });

    const wrapper = await saddle(server);
    const resp = await wrapper.fetch('/');

    await expect(resp).not.toHaveBodyText('hsfasfdasfi hello');
    await expect(resp).toHaveBodyText('hi hello');
    await expect(resp).toHaveStatus(200);
    await expect(resp).toHaveStatusText('OK');
  });

  it('can assert against JSON', async () => {
    const server = createServer((_req, res) => {
      res.writeHead(200);
      res.end(JSON.stringify({foo: ['bar', 'baz'], zip: 'zap'}));
    });

    const wrapper = await saddle(server);
    const resp = await wrapper.fetch('/');

    await expect(resp).not.toHaveBodyJson({tortelini: 'macaroni'});
    await expect(resp).toHaveBodyJson({foo: ['bar', 'baz']});
  });

  it('persists cookies across requests', async () => {
    const server = createServer((req, res) => {
      const hasCookie = req.headers.cookie?.includes('mycookie');

      if (hasCookie) {
        res.writeHead(200, {
          'Content-Type': 'text/plain',
        });
        res.end('request had cookie');
      } else {
        res.writeHead(200, {
          'Set-Cookie': 'mycookie=test; Max-Age=9999',
          'Content-Type': 'text/plain',
        });
        res.end('request had no cookie so we set it');
      }
    });

    const wrapper = await saddle(server);
    expect(wrapper).not.toHaveCookies({mycookie: 'test'});

    const firstResp = await wrapper.fetch('/');

    await expect(firstResp).toHaveBodyText(
      'request had no cookie so we set it',
    );
    await expect(firstResp).toHaveSetCookie('mycookie', 'test');
    expect(wrapper).toHaveCookies({mycookie: 'test'});

    const secondResp = await wrapper.fetch('/');
    await expect(secondResp).toHaveBodyText('request had cookie');
  });
});
