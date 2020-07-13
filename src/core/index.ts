import {Request, Response} from 'node-fetch';
import {Adapter, Listenable} from './types';
import {SaddleUp, Headers} from './SaddleUp';

export {Adapter, SaddleUp, Listenable, Headers};

export interface Options {
  host: string;
  port: number;
}

export async function saddle(app: Listenable, options: Partial<Options> = {}) {
  return SaddleUp.create(app, new CoreAdapter(), options);
}

export function unsaddle() {
  return SaddleUp.closeAll();
}

class CoreAdapter implements Adapter<Response> {
  fetchResult(_req: Request, resp: Response) {
    return resp;
  }
}
