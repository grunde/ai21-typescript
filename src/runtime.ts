import { BrowserFilesHandler } from './files/BrowserFilesHandler';
import { BrowserFetch, Fetch, NodeFetch } from './fetch';
import { NodeFilesHandler } from './files/NodeFilesHandler';
import { BaseFilesHandler } from './files/BaseFilesHandler';

export const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

/**
 * A Web Worker is a background thread that runs JavaScript code separate from the main thread.
 * Web Workers enable concurrent processing by:
 * - Running CPU-intensive tasks without blocking the UI
 * - Performing background operations like data fetching and processing
 * - Operating independently from the main window context
 */
export const isWebWorker =
  typeof self === 'object' &&
  typeof self?.importScripts === 'function' &&
  (self.constructor?.name === 'DedicatedWorkerGlobalScope' ||
    self.constructor?.name === 'ServiceWorkerGlobalScope' ||
    self.constructor?.name === 'SharedWorkerGlobalScope');

export const isNode =
  typeof process !== 'undefined' && Boolean(process.version) && Boolean(process.versions?.node);

export function createFetchInstance(): Fetch {
  if (isBrowser || isWebWorker) {
    console.log('Creating BrowserFetch instance');
    return new BrowserFetch();
  }

  console.log('Creating NodeFetch instance');
  return new NodeFetch();
}

export function createFilesHandlerInstance(): BaseFilesHandler {
  if (isBrowser || isWebWorker) {
    console.log('Creating BrowserFilesHandler instance');
    return new BrowserFilesHandler();
  }
  console.log('Creating NodeFilesHandler instance');
  return new NodeFilesHandler();
}
