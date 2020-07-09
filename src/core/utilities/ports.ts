import {Server} from 'http';

import {listen} from './server';
import {between} from './numbers';

export async function getFree(maxTries = 1000) {
  let port = between(3000, 8080);
  let tries = 0;

  while (await inUse(port)) {
    port++;
    tries++;

    if (tries > maxTries) {
      throw new Error(
        `Could not find a free port within ${maxTries} tries. Is something taking up all your ports?`,
      );
    }
  }

  return port;
}

export async function inUse(port: number) {
  const server = new Server();

  try {
    const tempServer = await listen(server, port);
    await tempServer.close();
    return false;
  } catch (err) {
    if (err.code === 'EADDRINUSE') {
      return true;
    }

    // if it isn't an EADDRESSINUSE something weird is wrong
    throw new Error(
      `An error ocurred when checking if port ${port} was free: ${err}`,
    );
  }
}
