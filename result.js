
const { preventUndefined, unprevent } = require( 'prevent-undefined' );
// const { rtti, make_vali_factory } = require( 'rtti.js' );

/*
 * TODO (Thu, 01 Dec 2022 12:00:19 +0900)
 * Rename `MSG_SUCCEEDED` and `MSG_ERROR` .
 */
const MSG_SUCCEEDED             = 'succeeded';
const MSG_ERROR                 = 'error';

// module.exports.MSG_SUCCEEDED    = MSG_SUCCEEDED;
// module.exports.MSG_ERROR        = MSG_ERROR;
// module.exports.MSG_INPUT_ERROR  = MSG_INPUT_ERROR;
// module.exports.MSG_OUTPUT_ERROR = MSG_OUTPUT_ERROR;

/**
 * The Rule of ContextResult
 * =================================================
 * 1. "don't place the result directly on the value"
 * 2. "return null if it has no result. don't throw errors."
 * 3. "errors should consist only errors."
 */
class AsyncContextResult {
  constructor(nargs) {
    if ( 'status' in nargs ) {
      this.status = nargs.status;
    } else {
      throw new TypeError( 'missing status field' );
    }

    if ( 'value' in nargs ) {
      this.value = nargs.value;
    } else {
      // ignore
      // this.value = value;
      this.value = null;
    }
  }
  ____IS_ASYNC_CONTEXT_RESULT____() {
    return true;
  }
  isSuccessful() {
    return this.status !== MSG_ERROR;
  }
  isErroneous() {
    return this.status !== MSG_SUCCEEDED;
  }
  isNull(fieldName) {
    if ( fieldName ) {
      return this.value[fieldName] == null;
    } else {
      throw new ReferenceError('the parameter `fieldName` was not specified.');
    }
  }
  throwIfNull( fieldName ) {
    if ( this.isNull( fieldName ) ) {
      throw this;
    }
    return this;
  }
  throwIfError() {
    if ( this.status === MSG_ERROR ) {
      // throw new Error( this.reason, {cause:this.cause, value:this.value});
      // throw new DatabaseContextError({message:'error with value', value:this }, {cause:this.cause });
      // throw this.value;
      throw unprevent( this );
    } else {
      return this;
    }
  }
  throwIfNotError() {
    if ( this.status !== MSG_ERROR ) {
      // throw new Error( this.reason, {cause:this.cause, value:this.value});
      // throw new DatabaseContextError({message:'error with value', value:this }, {cause:this.cause });
      // throw this.value;
      throw unprevent( this );
    } else {
      return this;
    }
  }

  static createResult(nargs) {
    return preventUndefined( new AsyncContextResult(nargs) );
  }

  static isResult (o) {
    return (
      ( o != null ) && 
      ( typeof o === 'object' ) &&
      ( '____IS_ASYNC_CONTEXT_RESULT____' in o )
    );
  };

  static createSuccessful( value ) {
    const status = MSG_SUCCEEDED;
    if ( value === undefined ) {
      return AsyncContextResult.createResult({ status,       });
    } else {
      return AsyncContextResult.createResult({ status, value });
    }
    return result;
  };

  static createErroneous( e, name = null ) {
    const status = MSG_ERROR;
    let value = e;
    // unprevent; it is suffice to prevent-undefined at the root of the object tree.  (Sat, 22 Oct 2022 19:17:04 +0900)
    value = unprevent( e );
    // this function moves the messageObject to message.
    value = filterErrorToJSON(value); 
    // if the error object ( that is, messageObject ) has value field, use it as the value.
    value = replaceMessageToValue(value);
    // append additional message
    if ( name !== null ) {
      if ( typeof value  ==='object' && value != null ) {
        value = { name, ...value };
      }
    }
    // create the result object.
    return AsyncContextResult.createResult({ status, value  });
  }
};
module.exports.AsyncContextResult = AsyncContextResult;




// if the error object ( that is, messageObject ) has value field, use it as the value.
function replaceMessageToValue(e) {
  return (
    true
    && ( typeof e         === 'object' ) 
    && ( 'message' in e )
    && ( typeof e.message === 'object' )
    && ( 'value' in e.message )
  ) ? e.value : e;
}

function getStackFromError(o) {
  if ( o == null ) {
    return o;
  } else if ( typeof o === 'object' ) {
    if ( 'stack' in o ) {
      if ( Array.isArray( o.stack ) ) {
        return o.stack;
      } else {
        if ( typeof o.stack === 'string' ) {
          return o.stack.split('\n');
        } else {
          // 1. this could be erroneous value but we ignore it.
          // 2. ensure it to be an array.
          return [ o.stack] ;
        }
      }
    } else {
      // ensure the result is an array.
      return [];
    }
  } else {
    // cannot retrieve stack; but we have to ensure it to be an array.
    return [];
  }
}

function filterErrorToJSON( input ) {
  const output =  __filterErrorToJSON( input );
  // console.log( 'filterErrorToJSON - Object.keys( input )', Object.keys( input ) );
  // console.log( 'filterErrorToJSON', 'input', input , 'output', output );
  return output;
}

function __filterErrorToJSON(o) {
  if ( o instanceof Error ) {
    const REPLACING_PROPERTIES = ['message', 'stack', 'cause'];
    return Object.assign( 
      {}, 
      { message : ((typeof o === 'object') && ('messageObject' in o ) ) ? __filterErrorToJSON( o.messageObject ) : o.message },
      { stack   : getStackFromError( o ) },
      { cause   : __filterErrorToJSON( o.cause )},
      ... Object.keys(o).filter( e=>! REPLACING_PROPERTIES.includes(e)).map( 
        k=>({
          [k] :__filterErrorToJSON(o[k])
        })),
    );
  } else if ( o === null ) {
    return null;
  } else if ( o === undefined ) {
    return undefined;
  } else if ( typeof o === 'object' ) {
    return Object.assign( Array.isArray( o ) ? [] : {}, ... Object.keys(o).map(k=>({[k]:__filterErrorToJSON(o[k])})));
  } else {
    return o;
  }
}


