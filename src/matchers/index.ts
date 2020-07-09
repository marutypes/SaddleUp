import {toHaveBodyText, toHaveBodyJson} from './body';
import {toHaveStatus, toHaveStatusText} from './status';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R, T = {}> {
      toHaveBodyJson(json: any): void;
      toHaveBodyText(text: string): void;
      toHaveStatus(status: number): void;
      toHaveStatusText(status: string): void;
    }
  }
}

expect.extend({
  toHaveBodyText,
  toHaveBodyJson,
  toHaveStatus,
  toHaveStatusText,
});
