import {unsaddle, Options, SaddleUp} from '..';

import {FetchResult, ExpressAdapter} from './adapter';

export {unsaddle, Options, FetchResult};

export const saddle = SaddleUp.adapt(new ExpressAdapter());
