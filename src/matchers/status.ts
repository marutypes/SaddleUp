import {Response} from 'node-fetch';
import {
  matcherHint,
  printExpected,
  printReceived,
  RECEIVED_COLOR as receivedColor,
} from 'jest-matcher-utils';

import {assertIsResponse, stringResponse} from './utilities';

export async function toHaveStatus(
  this: jest.MatcherUtils,
  response: Response,
  givenStatus: number,
) {
  const expectation = 'toHaveStatus';
  const notExpectation = `not.${expectation}`;
  const isNot = this.isNot;

  assertIsResponse(response, {
    expectation,
    isNot,
  });

  const resp = response.clone();
  const {status} = response;
  const pass = status === givenStatus;
  const prettyResponse = stringResponse(resp);

  const message = pass
    ? () =>
        `${matcherHint(notExpectation, 'response')}\n\n` +
        `Expected the Response:\n  ${receivedColor(prettyResponse)}\n` +
        `Not to have status:\n  ${printExpected(givenStatus)}\n` +
        `But it did:\n  ${receivedColor(status)}\n`
    : () =>
        `${matcherHint(expectation, 'response')}\n\n` +
        `Expected the Response:\n  ${receivedColor(prettyResponse)}\n` +
        `With status:\n  ${printReceived(status)}\n` +
        `To have status:\n  ${printExpected(givenStatus)}\n`;

  return {pass, message};
}

export async function toHaveStatusText(
  this: jest.MatcherUtils,
  response: Response,
  givenStatusText: string,
) {
  const expectation = 'toHaveStatusText';
  const notExpectation = `not.${expectation}`;
  const isNot = this.isNot;

  assertIsResponse(response, {
    expectation,
    isNot,
  });

  const resp = response.clone();
  const {statusText} = response;
  const pass = statusText === givenStatusText;
  const prettyResponse = stringResponse(resp);

  const message = pass
    ? () =>
        `${matcherHint(notExpectation, 'response')}\n\n` +
        `Expected the Response:\n  ${receivedColor(prettyResponse)}\n` +
        `Not to have statusText:\n  ${printExpected(givenStatusText)}\n` +
        `But it did:\n  ${receivedColor(status)}\n`
    : () =>
        `${matcherHint(expectation, 'response')}\n\n` +
        `Expected the Response:\n  ${receivedColor(prettyResponse)}\n` +
        `With statusText:\n  ${printReceived(status)}\n` +
        `To have statusText:\n  ${printExpected(givenStatusText)}\n`;

  return {pass, message};
}
