import Hapi from '@hapi/hapi';
import {saddle, unsaddle} from '.';
import '../matchers';

describe('saddle with nonstandard library APIs', () => {
  afterAll(() => {
    unsaddle();
  });

  it('works with a Hapi', async () => {
    const wrapper = await saddle((port, host) => {
      const server = Hapi.server({
        port,
        host,
      });

      server.route({
        path: '/',
        method: 'GET',
        handler() {
          return 'hi hello';
        },
      });

      server.start();
      return server.listener;
    });
    const resp = await wrapper.fetch('/');

    await expect(resp).not.toHaveBodyText('hsfasfdasfi hello');
    await expect(resp).toHaveBodyText('hi hello');
    await expect(resp).toHaveStatus(200);
    await expect(resp).toHaveStatusText('OK');
  });
});
