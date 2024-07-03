'use strict';

import { preventUndefined, unprevent } from 'prevent-undefined' ;
import { schema, trace_validator   }   from 'vanilla-schema-validator' ;
import { typesafe_function  } from 'runtime-typesafety' ;
import { AsyncContextLogger }          from './logger.mjs' ;
import { init as init_schema }         from './schema.mjs';

init_schema( schema );

const MSG_ERROR_VALUE           = '__errorValue__';
const MSG_INPUT_ERROR           = 'leave-with-input-object-validation-failure';
const MSG_OUTPUT_ERROR          = 'leave-with-output-object-validation-failure';

function filter_ansi(m) {
  return m.replace( /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '' );
}
const ORIGINAL_ERROR_FILTER_00 = (__e)=>{
  const e = {
    message : __e.message,
    stack : __e.stack,
    cause : __e.cause,
  };
    Object.defineProperty( e,'message',
      {
        value : filter_ansi( e.message ),
        configurable : true,
        writable : false,
        enumerable : true,
      });

    Object.defineProperty( e,'stack',
      {
        value : filter_ansi( e.stack ),
        configurable : true,
        writable : false,
        enumerable : true,
      });

  if ( ( 'message' in e ) && ( typeof e.message === 'string' ) ) {
  };
  if ( ( 'stack' in e ) && ( typeof e.stack === 'string' ) ) {
  };
  return e;
};

const ERROR_FILTER_THRU = (__e)=>{
  return __e;
};


const WRITE_DIR_OPTIONS = {
  colors         : true,
  depth          : null,
  maxArrayLength : null,
};

/**
 * TAG_PROC_USERS
 */
let __defaultOptions = {
  showReport               : false,
  suppressSuccessfulReport : false,
  coloredReport            : false,
  reportMethod             : 'console',
  filterError              : ERROR_FILTER_THRU,
  writeLog                 : async(...arg)=>console.log(...args),
  writeDir                 : async(...arg)=>console.dir(...args, WRITE_DIR_OPTIONS ),
};

class AsyncContext {
  constructor ( name = 'AsyncContext' ) {
    this.name                = name;
    this.__options           = Object.assign( {}, __defaultOptions );
    this.contextInitializers = [];
    this.contextFinalizers   = [];
    // this.A0= 'DatabaseContextError';
    this.contextInitializers.push( async function asyncContextInitializer() {
      await this.logger.beginReport();
    });
    this.contextFinalizers.push( async function asyncContextFinalizer(is_successful) {
      await this.logger.endReport({is_successful});
    });
    this.logger = new AsyncContextLogger( name, this.__options );
  }

  getOptions() {
    return this.__options;
  }

  setOptions(__options) {
    this.__options  = Object.assign( this.__options, __options );

    const are_valid_options = trace_validator( schema.t_async_context_options(), this.__options );
    if ( ! are_valid_options.value ) {
      throw new Error( 'specified options was incorrect ' + are_valid_options.report() );
    }

    this.logger.setOptions( this.name, this.__options );

    // if ( ! schema.t_async_context_options()( this.__options ) ) {
    //   console.error( this.__options );
    //   throw new Error( 'specified options was incorrect' );
    // }
    return this;
  }

  /**
   * executeSafely()
   * --------------------------------------------------------------------------------
   * wrap the specified function by asynchronous-context safe execution block
   */

  /*
   * About `this.event_handlers`
   * --------------------------------------------------------------------------------
   *
   * This `this` points to `AsyncContext` class.
   *
   * > Calling static members from another static method ###
   * >
   * > In order to call a static method or property within another static
   * >  method of the same class, you can use the this keyword.
   *
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/static
   */

  /*
   * About `fold-args`
   * --------------------------------------------------------------------------------
   * See the documentation of `fold-args`  for further information about
   * `args-folding-call-convention`.
   */
  static executeSafely( ...args ) {
    // if ( fn.constructor.name !== 'AsyncFunction' ) {
    //   throw new Error( `HEADS UPP LOOK AT MEEEEEEEEEEEEEEEE ITS NOT AN ASYNC FUNCTION!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ${fn.constructor.name}` );
    // }
    return typesafe_function( ...args, this.event_handlers );
  }

  static event_handlers = {
    on_enter(nargs) {
      this.logger.enter( nargs.fn_name, nargs.args ) ;
    },
    on_leave(nargs) {
      this.logger.leave( nargs.fn_name, nargs.result );
    },
    on_leave_with_error(nargs) {
      this.logger.leave_with_error( nargs.fn_name, this.__options.filterError( nargs.error ) );
    },
    on_input_error(nargs) {
      // if ( 'trace_validator_result' in nargs ) {
      //   this.logger.output({
      //     type  : MSG_INPUT_ERROR,
      //     name  : nargs.fn_name,
      //     value : nargs.trace_validator_result.report(),
      //   });
      // } else {
      //   this.logger.output({
      //     type  : MSG_INPUT_ERROR,
      //     name  : nargs.fn_name,
      //     value : nargs.message,
      //   });
      // }
    },
    on_output_error(nargs) {
      // if ( 'trace_validator_result' in nargs ) {
      //   this.logger.output({
      //     type  : MSG_OUTPUT_ERROR,
      //     name  : nargs.fn_name,
      //     value : nargs.trace_validator_result.report(),
      //   });
      // } else {
      //   this.logger.output({
      //     type  : MSG_OUTPUT_ERROR,
      //     name  : nargs.fn_name,
      //     value : nargs.message,
      //   });
      // }
    },
  };

  /*
   *
   * --------------------------------------------------------------------------------
   *
   */
  async multiple_proc( nargs ) {
    this.logger.log( {name:'internal_multiple_proc(start)', nargs} );
    const connection  = this;
    const {
      fn          = enp( 'fn' ),
      arrayOfArgs = enp( 'arrayOfArgs' ),
    } = nargs;

    // >>> MODIFIED (Fri, 30 Dec 2022 18:46:41 +0900)
    // Note that this modification was not tested.
    // This is not frequently used.
    let totalResult = await arrayOfArgs.reduce( async (promise,args)=>{
      // require('beep').beep({length:0.025});
      const result = await promise;
      try {
        const res = (await fn.call( connection, { ... args, }));
        result.push({ is_successful : true,  value : res } );
      } catch ( e ) {
        result.push({ is_successful : false, value : e } );
      }
      return result;
    }, Promise.resolve([]));

    this.logger.log( {name:'multiple_proc(totalResult)', totalResult });

 // let findResult = totalResult.find((e)=>(  e.status!==MSG_SUCCEEDED ));
    let findResult = totalResult.find((e)=>(! e.is_successful ));

    this.logger.log( {name:'totalResult(findResult)', findResult });

    if ( findResult !== undefined ) {
      // =========================================
      // Search Tag : TAG_MANUAL_ROLLBACK
      // Manually Rollback the current transaction.
      // =========================================
      // (await rollback_transaction( connection ));

      // (Fri, 30 Dec 2022 18:54:08 +0900)
      // `value.reason` is very suspicious; it does not exist in AsyncContextResult()
      let e = new Error( findResult.value.reason, {cause : findResult.value.cause } );
      e[MSG_ERROR_VALUE] = totalResult.map(e=>e.value);
      throw e;
    } else {
      return totalResult.map(e=>e.value);
    }
    // <<< MODIFIED (Fri, 30 Dec 2022 18:46:41 +0900)
  }

  static {
    AsyncContext.prototype.multiple_proc = AsyncContext.executeSafely( AsyncContext.prototype.multiple_proc );
  }


  /**
   * When autocommit mode is enabled, `executeTransaction` will automatically
   * execute commit statement unless the function that is specified in `fn`
   * parameter failed. `executeTransaction()` function considers `fn` is failed
   * when :
   *
   *   - the `status` field of its return value is other than MSG_SUCCEEDED
   *   - it throws an error object
   *   - (deprecated in Jul 17 2022) there is any error in the log list after its execution
   *
   * Otherwise `executeTransaction` will leave the current transaction
   * untouched so the user must manually execute the transactional commands.
   */

  async executeTransaction( fn, ...args ) {
    // >>> DEACTIVATED (Mon, 05 Jun 2023 14:44:59 +0900)
    // ADDED (Wed, 31 Aug 2022 15:01:34 +0900)
    // fn = AsyncContext.executeSafely( fn );
    // <<< DEACTIVATED (Mon, 05 Jun 2023 14:44:59 +0900)

    try {
      await this.initializeContext();
    } catch (e) {
      // this will actually never happen.
      console.error( 'internal error(1)', e );
    }
    try {
      const result = await fn.call( this, ... args );

      try {
        await this.finalizeContext(true);
      } catch (e) {
        // this will actually never happen.
        console.error( 'internal error(2)', e );
      }
      return result;
    } catch (e) {
      try {
        await this.finalizeContext(false);
      } catch (e) {
        // this will actually never happen.
        console.error( 'internal error(3)', e );
      }
      throw e;
    }
  }

  /**
   *
   */
  async initializeContext() {
    for ( const i of this.contextInitializers ) {
      try {
        await i.call(this);
      } catch ( e ) {
        console.error( 'initializeContext error',e );
        this.logger.error( 'initializeContext error', e );
      }
    }
  }

  /**
   *
   */
  async finalizeContext(is_successful) {
    for ( const i of this.contextFinalizers ) {
      try {
        await i.call(this,is_successful);
      } catch ( e ) {
        console.error('finalizeContext error',e);
        this.logger.error('finalizeContext error',e);
      }
    }
  }
}

function create(...args) {
  // throw new Error('calling create() is prohibited');

  // A static dynamic function; which you can't perform on JAVA.
  // BUMMER! ABOVE IS NOT TRUE!  // (Thu, 05 Jan 2023 19:09:00 +0900)
  // throw new Error('calling this method is prohibited');
  return new this(...args);
}
AsyncContext.create = create;

function  __defineMethod( isOverride, ... args ) {
  // A static dynamic function; which you can't perform on JAVA.
  const targetClass = this;

  // (Tue, 06 Sep 2022 11:42:27 +0900)
  // note that `args` arguments are ignored when fn is already a typesafe function.
  const fn = AsyncContext.executeSafely( ...args );
  const methodName = fn.name;

  if ( ! methodName ) {
    throw new TypeError( 'no method name was specified' );
  }

  // Check naming conflicts.
  if ( ! isOverride ) {
    if ( methodName in targetClass.prototype ) {
      throw new TypeError( 'the method is already defined. ('+ methodName + ')' );
    }
  }

  Object.defineProperty( targetClass.prototype, methodName, {
    value        : fn,
    enumerable   : false,
    writable     : false,
    configurable : true,
  });

  return fn;
};
AsyncContext.__defineMethod = __defineMethod;

function defineMethod( ...args ) {
  return this.__defineMethod( false, ...args);
};
AsyncContext.defineMethod = defineMethod;

function overrideMethod( ...args ) {
  return this.__defineMethod( true, ...args);
};
AsyncContext.overrideMethod = overrideMethod;

function referMethod( name ) {
  if ( name instanceof Function ) {
    name = name.name ?? 'unknown';
  }
  if ( name in this.prototype ) {
    return this.prototype[name];
  } else {
    throw new ReferenceError('method "' + name + '"is not defined');
  }
}
AsyncContext.referMethod = referMethod;




export { AsyncContext };


// module.exports = module.exports;


