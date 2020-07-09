import {Response} from 'node-fetch';
import {
  matcherHint,
  printExpected,
  printReceived,
  RECEIVED_COLOR as receivedColor,
} from 'jest-matcher-utils';

import {assertIsResponse, stringResponse} from './utilities';

export async function toHaveBodyText(
  this: jest.MatcherUtils,
  response: Response,
  text: string,
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
  const pass = responseText.includes(text);
  const prettyResponse = stringResponse(resp, responseText);

  const message = pass
    ? () =>
        `${matcherHint(notExpectation, 'response')}\n\n` +
        `Expected the Response:\n  ${receivedColor(prettyResponse)}\n` +
        `Not to contain text:\n  ${printExpected(text)}\n` +
        `But it did:\n  ${receivedColor(responseText)}\n`
    : () =>
        `${matcherHint('.not.toContainReactText', 'response')}\n\n` +
        `Expected the Response:\n  ${receivedColor(prettyResponse)}\n` +
        `With text content:\n  ${printReceived(responseText)}\n` +
        `To contain string:\n  ${printExpected(text)}\n`;

  return {pass, message};
}

export async function toHaveBodyJson(
  this: jest.MatcherUtils,
  response: Response,
  givenJson: any,
) {
  const expectation = 'toHaveBodyJson';
  const notExpectation = `.not.${expectation}`;
  const isNot = this.isNot;

  assertIsResponse(response, {
    expectation,
    isNot,
  });

  const resp = response.clone();
  const responseJson = await resp.json();
  const pass = Object.keys(givenJson).every((key) =>
    this.equals(responseJson[key], givenJson[key]),
  );
  const prettyResponse = stringResponse(resp);
  const prettyResponseJson = JSON.stringify(responseJson);

  const message = pass
    ? () =>
        `${matcherHint(notExpectation, 'response')}\n\n` +
        `Expected the Response:\n  ${receivedColor(prettyResponse)}\n` +
        `Not to contain:\n  ${printExpected(givenJson)}\n` +
        `But it did:\n  ${receivedColor(prettyResponseJson)}\n`
    : () =>
        `${matcherHint('.not.toContainReactText', 'response')}\n\n` +
        `Expected the Response:\n  ${receivedColor(prettyResponse)}\n` +
        `With JSON content:\n  ${printReceived(prettyResponseJson)}\n` +
        `To contain:\n  ${printExpected(givenJson)}\n`;

  return {pass, message};
}
