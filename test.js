
const {createTest} = require( './test-utils.js' );
const { describe, it, before, after }  = require( 'node:test' );

/*
 * Explicit is Better Than Implicit
 * =================================
 *
 * I decided not to use this module since this effectively
 * hide what is going on to the test framework.
 * (Wed, 19 Apr 2023 11:42:50 +0900)
 */
throw new Error('see the source code');

module.exports = ( createContext, ...nargs)=>{
  return {
    describe : describe,
    it       : createTest( it      , createContext, ...nargs ),
    before   : createTest( before  , createContext, ...nargs ),
    after    : createTest( after   , createContext, ...nargs ),
    testdb   : createTest( it      , createContext, ...nargs ),
  };
};


