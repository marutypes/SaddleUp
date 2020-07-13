import createServer, {HandleFunction} from 'connect';

import {unsaddle, Options, SaddleUp} from '..';

import {FetchResult, ConnectAdapter, DecorationOptions} from './adapter';

export {unsaddle, Options, FetchResult};

export async function saddle(
  app: createServer.Server | HandleFunction,
  {
    beforeMiddleware,
    afterMiddleware,
    ...options
  }: Partial<Options> & DecorationOptions = {},
) {
  const adapter = new ConnectAdapter();
  const listenable = adapter.decorate(app, {
    beforeMiddleware,
    afterMiddleware,
  });
  return SaddleUp.create<FetchResult>(listenable, adapter, options);
}
