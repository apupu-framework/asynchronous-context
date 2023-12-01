
import { AsyncContext } from './context';
export function createContext( ...args ) {
  return AsyncContext.create( ...args );
}

