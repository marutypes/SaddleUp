import Koa, {Middleware} from 'koa';

import {unsaddle, SaddleUp, Options} from '..';
import {KoaAdapter, FetchResult, DecorationOptions} from './adapter';

export {unsaddle, Options};

export async function saddle(
  app: Koa | Middleware,
  {
    beforeMiddleware,
    afterMiddleware,
    state,
    ...options
  }: Partial<Options> & DecorationOptions = {},
) {
  const adapter = new KoaAdapter();
  const listenable = adapter.decorate(app, {
    beforeMiddleware,
    afterMiddleware,
    state,
  });
  return SaddleUp.create<FetchResult>(listenable, adapter, options);
}
