
import { AsyncContext } from './context.mjs';
export function createContext( ...args ) {
  return AsyncContext.create( ...args );
}

