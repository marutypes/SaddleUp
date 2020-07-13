import {
  matcherHint,
  printExpected,
  printReceived,
  diff,
  RECEIVED_COLOR as receivedColor,
} from 'jest-matcher-utils';

import {FetchResult} from '../adapter-koa';
import {assertIsResponse} from './utilities';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R, T = {}> {
      toHaveKoaState(state: any): Promise<void>;
    }
  }
}

function toHaveKoaState(
  this: jest.MatcherUtils,
  response: FetchResult,
  expectedState: any,
) {
  const expectation = 'toHaveKoaState';
  const notExpectation = `.not.${expectation}`;
  const isNot = this.isNot;

  assertIsResponse(response, {
    expectation,
    isNot,
  });

  const resp = response.clone();
  const {koaState} = response;

  const pass = Object.keys(expectedState).every((key) =>
    this.equals(koaState[key], expectedState[key]),
  );

  const prettyResponse = JSON.stringify(resp);

  const message = pass
    ? () =>
        `${matcherHint(notExpectation, 'response')}\n\n` +
        `Expected the Response:\n  ${receivedColor(prettyResponse)}\n` +
        `Not to have associated Koa state:\n  ${printExpected(
          expectedState,
        )}\n` +
        `But it did:\n  ${printReceived(koaState)}\n`
    : () => {
        const diffString = diff(expectedState, koaState);
        return (
          `${matcherHint(expectation, 'response')}\n\n` +
          `Expected the Response:\n  ${receivedColor(prettyResponse)}\n` +
          `To have headers:\n  ${printExpected(expectedState)}\n` +
          `Received:\n  ${printReceived(koaState)}\n${
            diffString ? `Difference:\n${diffString}\n` : ''
          }`
        );
      };

  return {pass, message};
}

expect.extend({
  toHaveKoaState,
});
