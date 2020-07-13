import {Response} from 'node-fetch';
import {
  matcherHint,
  printExpected,
  printReceived,
  diff,
  RECEIVED_COLOR as receivedColor,
} from 'jest-matcher-utils';

import {SaddleUp, Headers} from '..';
import {assertIsResponse, assertIsSaddleUp, stringResponse} from './utilities';

export function toHaveSetCookie(
  this: jest.MatcherUtils,
  response: Response,
  cookieName: string,
  value?: string,
) {
  const expectation = 'toHaveSetCookie';
  const notExpectation = `not.${expectation}`;
  const isNot = this.isNot;

  assertIsResponse(response, {
    expectation,
    isNot,
  });

  const expected = value == null ? cookieName : `${cookieName}=${value}`;
  const resp = response.clone();
  const {headers} = resp;
  const actualSetCookieHeader = headers.get(Headers.SetCookie);
  const pass = Boolean(
    actualSetCookieHeader && actualSetCookieHeader.includes(expected),
  );
  const prettyResponse = stringResponse(resp);

  const message = pass
    ? () =>
        `${matcherHint(notExpectation, 'response')}\n\n` +
        `Expected the Response:\n  ${receivedColor(prettyResponse)}\n` +
        `Not to set cookie:\n  ${printExpected(expected)}\n` +
        `But it did:\n  ${receivedColor(actualSetCookieHeader)}\n`
    : () =>
        `${matcherHint(expectation, 'response')}\n\n` +
        `Expected the Response:\n  ${receivedColor(prettyResponse)}\n` +
        `With cookie:\n  ${printReceived(actualSetCookieHeader)}\n` +
        `To set cookie:\n  ${printExpected(expected)}\n`;

  return {pass, message};
}

export function toHaveCookies(
  this: jest.MatcherUtils,
  saddle: SaddleUp<any, any, any>,
  expectedCookies: Record<string, string>,
) {
  const expectation = 'toHaveCookies';
  const notExpectation = `not.${expectation}`;
  const isNot = this.isNot;

  assertIsSaddleUp(saddle, {
    expectation,
    isNot,
  });

  const actualCookies = saddle.cookies;
  const pass = Object.keys(expectedCookies).every((key) =>
    this.equals(expectedCookies[key], actualCookies[key]),
  );

  const message = pass
    ? () =>
        `${matcherHint(notExpectation, 'wrapper')}\n\n` +
        `Expected the wrapper:\n  ${printReceived(saddle)}\n` +
        `Not to have cookies:\n  ${printExpected(expectedCookies)}\n` +
        `But it did:\n  ${receivedColor(JSON.stringify(actualCookies))}\n`
    : () => {
        const diffString = diff(expectedCookies, actualCookies);

        return (
          `${matcherHint(expectation, 'response')}\n\n` +
          `Expected the wrapper:\n  ${printReceived(saddle)}\n` +
          `To have cookies:\n  ${printExpected(expectedCookies)}\n` +
          `Received:\n  ${printReceived(actualCookies)}\n${
            diffString ? `Difference:\n${diffString}\n` : ''
          }`
        );
      };

  return {pass, message};
}
