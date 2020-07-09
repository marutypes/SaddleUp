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

    expect(resp).not.toHaveBodyText('hsfasfdasfi hello');
    expect(resp).toHaveBodyText('hi hello');
    expect(resp).toHaveStatus(200);
    expect(resp).toHaveStatusText('OK');
  });

  it('can assert against the response', async () => {
    const server = createServer((_req, res) => {
      res.writeHead(200);
      res.end(JSON.stringify({foo: ['bar', 'baz'], zip: 'zap'}));
    });

    const wrapper = await saddle(server);
    const resp = await wrapper.fetch('/');

    await expect(resp).not.toHaveBodyJson({tortelini: 'macaroni'});
    await expect(resp).toHaveBodyJson({foo: ['bar', 'baz']});
  });
});
