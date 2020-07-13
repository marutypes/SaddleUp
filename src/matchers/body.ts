import {Response} from 'node-fetch';
import {
  matcherHint,
  printExpected,
  printReceived,
  diff,
  RECEIVED_COLOR as receivedColor,
} from 'jest-matcher-utils';

import {assertIsResponse, stringResponse} from './utilities';

export async function toHaveBodyText(
  this: jest.MatcherUtils,
  response: Response,
  expectedText: string,
) {
  const expectation = 'toHaveBodyText';
  const notExpectation = `.not.${expectation}`;
  const isNot = this.isNot;

  assertIsResponse(response, {
    expectation,
    isNot,
  });

  const resp = response.clone();
  const responseText = await resp.text();
  const pass = responseText.includes(expectedText);
  const prettyResponse = stringResponse(resp, responseText);

  const message = pass
    ? () =>
        `${matcherHint(notExpectation, 'response')}\n\n` +
        `Expected the Response:\n  ${receivedColor(prettyResponse)}\n` +
        `Not to contain text:\n  ${printExpected(expectedText)}\n` +
        `But it did:\n  ${receivedColor(responseText)}\n`
    : () =>
        `${matcherHint(expectation, 'response')}\n\n` +
        `Expected the Response:\n  ${receivedColor(prettyResponse)}\n` +
        `With text content:\n  ${printReceived(responseText)}\n` +
        `To contain string:\n  ${printExpected(expectedText)}\n`;

  return {pass, message};
}

export async function toHaveBodyJson(
  this: jest.MatcherUtils,
  response: Response,
  expectedJson: any,
) {
  const expectation = 'toHaveBodyJson';
  const notExpectation = `.not.${expectation}`;
  const isNot = this.isNot;

  assertIsResponse(response, {
    expectation,
    isNot,
  });

  const resp = response.clone();
  const actualJson = await resp.json();
  const pass = Object.keys(expectedJson).every((key) =>
    this.equals(actualJson[key], expectedJson[key]),
  );
  const prettyResponse = stringResponse(resp);

  const message = pass
    ? () =>
        `${matcherHint(notExpectation, 'response')}\n\n` +
        `Expected the Response:\n  ${receivedColor(prettyResponse)}\n` +
        `Not to contain:\n  ${printExpected(expectedJson)}\n` +
        `But it did:\n  ${receivedColor(actualJson)}\n`
    : () => {
        const diffString = diff(expectedJson, actualJson);

        return (
          `${matcherHint(expectation, 'response')}\n\n` +
          `Expected the Response:\n  ${receivedColor(prettyResponse)}\n` +
          `To have JSON content:\n  ${printExpected(expectedJson)}\n` +
          `Received:\n  ${printReceived(actualJson)}\n${
            diffString ? `Difference:\n${diffString}\n` : ''
          }`
        );
      };

  return {pass, message};
}
