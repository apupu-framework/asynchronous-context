import { AsyncContext } from './context.mjs' ;

export function createTest( originalTest, createContext, options ) {
  if ( ! createContext ) {
    throw new ReferenceError( '`createContext` must be specified' );
  }
  function testex(...args){
    const first = 0;
    const last = args.length-1;

    const msg =  args.length < 2 ? 'default test' : args[first];
    const fn  = args[last];

    args[last] = async (...args2 )=>{
      try {
        return await (
          createContext( msg )
            .setOptions( options )
            .executeTransaction( AsyncContext.executeSafely( fn ),  ...args2 ));
      } catch (e) {
        // console.error(e);
        throw e;
      }
    };
    originalTest ( ...args );
  }
  return testex;
}

// module.exports.createTest = createTest;


