const { AsyncContext } =  require( 'async-context/context' );

function createJestTester( jestTest, createContext, options ) {
  if ( ! createContext ) {
    throw new Error( '`createContext` must be specified' );
  }
  function testdb(...args){
    const msg = args[0];
    const fn  = args[1];
    args[1] = async (...args2 )=>{
      try {
        return await (
          createContext( msg )
            .setOptions( options )
            .executeTransaction( AsyncContext.executeSafely( fn ),  ...args2 ));
      } catch (e) {
        const e2 = new Error( 'the test was finished via throwing an error : ', {cause:e});
        /*
         * (Thu, 17 Nov 2022 14:56:15 +0900)
         * Jest does not show the inside of {cause:} object. What should I do next.
         */
        console.error('ERROR OCCURED !! CAUSE IS `', e2.cause,'`');

        /*
         * (Thu, 27 Oct 2022 20:27:49 +0900)
         * Convert the thrown object as Error; Jest does not recognize other
         * thrown objects as error than Error() instances. 
         */
        throw e2;
        
      }
      // >>> COMMENTED OUT (Thu, 27 Oct 2022 11:48:15 +0900)
      // const connection = Context.create( msg, options );
      // try {
      //   return await ( connection.executeTransaction( Context.executeSafely( fn ),  ...args2 ));
      // } finally {
      //   if ( 'finalizeContextOfDatabaseContext' in connection ) {
      //     await connection.finalizeContextOfDatabaseContext();
      //   }
      // }
      // <<< COMMENTED OUT (Thu, 27 Oct 2022 11:48:15 +0900)
    };
    jestTest ( ...args );
  }
  return testdb;
}

module.exports.createJestTester = createJestTester;


function extendExpect(jestExpect) {
  const { AsyncContextResult } = require('async-context/result');
  jestExpect.extend({
    toCorrectlyThrow( received, expectedValue ) {
      let thrownValue = null;
      try {
        received()
      } catch (e){
        thrownValue = e; 
      }
      if ( thrownValue === null ) {
        return {
          message: () => `expect ${expectedValue} was thrown but no value was thrown`,
          pass: false,
        };
      }

      if ( expectedValue ==null ) {
        return {
          message: () => `no expected value was specified but ${received} was thrown, anyway`,
          pass: true,
        };
      }

      if ( thrownValue !== expectedValue ) {
        return {
          message: () => `expect ${expectedValue} was thrown but the value was ${thrownValue}`,
          pass: false,
        };
      }
      return {
        message: () => `${received} was thrown as expected`,
        pass: true,
      };
    },
  });

  jestExpect.extend({
    async toCorrectlyThrowAsyncContextResult( received ) {
      const pass = received instanceof AsyncContextResult;
      if (pass) {
        return {
          message: () => `AsyncContextResult was thrown`,
          pass: true,
        };
      } else {
        return {
          message: () => `AsyncContextResult was not thrown`,
          pass: false,
        };
      }
    },
  });
}

module.exports.extendExpect = extendExpect;

