import {Response} from 'node-fetch';
import {
  matcherHint,
  printExpected,
  printReceived,
  RECEIVED_COLOR as receivedColor,
  diff,
} from 'jest-matcher-utils';

import {Headers} from '..';
import {assertIsResponse, stringResponse} from './utilities';

export function toHaveHeaders(
  this: jest.MatcherUtils,
  response: Response,
  expectedHeaders: Record<string, string>,
) {
  const expectation = 'tohaveHeaders';
  const notExpectation = `not.${expectation}`;
  const isNot = this.isNot;

  assertIsResponse(response, {
    expectation,
    isNot,
  });

  const resp = response.clone();
  const {headers} = resp;
  const pass = Object.keys(expectedHeaders).every((key) =>
    this.equals(expectedHeaders[key], headers.get(key)),
  );
  const prettyResponse = stringResponse(resp);
  const message = pass
    ? () =>
        `${matcherHint(notExpectation, 'response')}\n\n` +
        `Expected the Response:\n  ${receivedColor(prettyResponse)}\n` +
        `Not to have headers:\n  ${printExpected(expectedHeaders)}\n` +
        `But it did:\n  ${printReceived(headers)}\n`
    : () => {
        const diffString = diff(headers, expectedHeaders);

        return (
          `${matcherHint(expectation, 'response')}\n\n` +
          `Expected the Response:\n  ${receivedColor(prettyResponse)}\n` +
          `To have headers:\n  ${printExpected(expectedHeaders)}\n` +
          `Received:\n  ${printReceived(headers)}\n${
            diffString ? `Difference:\n${diffString}\n` : ''
          }`
        );
      };
  return {pass, message};
}
