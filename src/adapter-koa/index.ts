import {unsaddle, SaddleUp, Options} from '..';
import {KoaAdapter, FetchResult} from './adapter';

export {unsaddle, Options, FetchResult};

export const saddle = SaddleUp.adapt(new KoaAdapter());
