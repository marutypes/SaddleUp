import {Express, Handler} from 'express';

import {unsaddle, Options, SaddleUp} from '..';

import {FetchResult, ExpressAdapter, DecorationOptions} from './adapter';

export {unsaddle, Options, FetchResult};

export async function saddle(
  app: Express | Handler,
  {
    beforeMiddleware,
    afterMiddleware,
    ...options
  }: Partial<Options> & DecorationOptions = {},
) {
  const adapter = new ExpressAdapter();
  const listenable = adapter.decorate(app, {
    beforeMiddleware,
    afterMiddleware,
  });
  return SaddleUp.create<FetchResult>(listenable, adapter, options);
}
