import {unsaddle, Options, SaddleUp} from '..';

import {FetchResult, ConnectAdapter} from './adapter';

export {unsaddle, Options, FetchResult};

export const saddle = SaddleUp.adapt(new ConnectAdapter());
