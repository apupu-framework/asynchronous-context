const { AsyncContext } =  require( 'async-context/context' );

function createTest( originalTest, createContext, options ) {
  if ( ! createContext ) {
    throw new ReferenceError( '`createContext` must be specified' );
  }
  function testex(...args){
    const msg = args[0];
    const fn  = args[1];

    args[1] = async (...args2 )=>{
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

module.exports.createTest = createTest;


