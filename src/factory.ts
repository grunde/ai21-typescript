import { BrowserFilesHandler } from './files/BrowserFilesHandler';
import { BrowserFetch, Fetch, NodeFetch } from './fetch';
import { NodeFilesHandler } from './files/NodeFilesHandler';
import { BaseFilesHandler } from './files/BaseFilesHandler';
import { isBrowser, isWebWorker } from 'runtime';

export function createFetchInstance(): Fetch {
  if (isBrowser || isWebWorker) {
    return new BrowserFetch();
  }

  return new NodeFetch();
}

export function createFilesHandlerInstance(): BaseFilesHandler {
  if (isBrowser || isWebWorker) {
    return new BrowserFilesHandler();
  }

  return new NodeFilesHandler();
}
