
const { AsyncContext } = require( './context' );
function createContext( ...args ) {
  return AsyncContext.create( ...args );
}

module.exports.createContext = createContext;
