import {Response} from 'node-fetch';

import {
  matcherErrorMessage,
  matcherHint,
  RECEIVED_COLOR as receivedColor,
} from 'jest-matcher-utils';

export function assertIsResponse(
  resp: unknown,
  {expectation, isNot}: {expectation: string; isNot: boolean},
) {
  if (resp instanceof Response) {
    return;
  }

  if (resp == null) {
    throw new Error(
      matcherErrorMessage(
        matcherHint(`.${expectation}`, undefined, undefined, {isNot}),
        `${receivedColor('received')} value must be a Response object`,
        `Received ${receivedColor('null')}.`,
      ),
    );
  }

  if (typeof resp === 'object') {
    throw new Error(
      matcherErrorMessage(
        matcherHint(`.${expectation}`, undefined, undefined, {isNot}),
        `${receivedColor('received')} value must be a Response object`,
        `Received ${receivedColor(JSON.stringify(resp))}.`,
      ),
    );
  }
}

export function stringResponse(resp: Response, parsedBody?: string) {
  return JSON.stringify({
    status: resp.status,
    statusText: resp.statusText,
    body: parsedBody || '<<omitted>>',
    headers: resp.headers,
  });
}
