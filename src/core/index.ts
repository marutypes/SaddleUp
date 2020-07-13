import {Request, Response} from 'node-fetch';
import {Adapter, Listenable, Options} from './types';
import {SaddleUp, Headers} from './SaddleUp';

export {Adapter, SaddleUp, Listenable, Headers, Options};

export function unsaddle() {
  return SaddleUp.closeAll();
}

class CoreAdapter implements Adapter<Listenable, Response, Options> {
  decorate(app: Listenable, _options: Options): Listenable {
    return app;
  }

  fetchResult(_req: Request, resp: Response) {
    return resp;
  }
}

const defaultAdapter = new CoreAdapter();
export const saddle = SaddleUp.adapt(defaultAdapter);
