
// const util = require( 'node:util' );
// const process = require( 'process' );
import { Console } from 'node:console' ;
import { preventUndefined, unprevent } from 'prevent-undefined' ;

const __util = typeof util === 'undefined' ? {} : util;
const __process = (typeof process) === 'undefind' ? {} : process;
// const { Console = function(){} } = console ;

// const sanitizeAnsi = (s)=>
//   typeof s ==='string' ? s.replace( /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '' ) : s;
const sanitizeAnsi = (s)=>
  typeof s ==='string' ? s.replace( /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '' ) : s;

const utilInspectCustom = __util?.inspect?.custom ?? {};
const recursivelySanitizeAnsi = (obj,stack=[])=>{
  // if ( stack.includes(obj) ) {
  //   console.log('found a circular reference');
  //   return obj;
  // } else {
  //   stack.push ( obj );
  // }

  if ( typeof obj === 'object' && obj !== null ) {
    Object.getOwnPropertyNames( obj ).forEach((key)=>{
      const value = obj[key];
      const new_value = recursivelySanitizeAnsi( value, stack );
      if ( value !== new_value ) {
        obj[key] = new_value;
      }
    });
    return obj;
  } else {
    return sanitizeAnsi( obj );
  }
};

if ( typeof __util.inspect === 'undefined' ) {
  __util.inspect = ()=>'';
}

const TERM_RESET      = "\x1b[0m" ;
const TERM_BRIGHT     = "\x1b[1m" ;
const TERM_DIM        = "\x1b[2m" ;
const TERM_UNDERSCORE = "\x1b[4m" ;
const TERM_BLINK      = "\x1b[5m" ;
const TERM_REVERSE    = "\x1b[7m" ;
const TERM_HIDDEN     = "\x1b[8m" ;

const TERM_FG_BLACK   = "\x1b[30m";
const TERM_FG_RED     = "\x1b[31m";
const TERM_FG_GREEN   = "\x1b[32m";
const TERM_FG_YELLOW  = "\x1b[33m";
const TERM_FG_BLUE    = "\x1b[34m";
const TERM_FG_MAGENTA = "\x1b[35m";
const TERM_FG_CYAN    = "\x1b[36m";
const TERM_FG_WHITE   = "\x1b[37m";

const TERM_BG_BLACK   = "\x1b[40m";
const TERM_BG_RED     = "\x1b[41m";
const TERM_BG_GREEN   = "\x1b[42m";
const TERM_BG_YELLOW  = "\x1b[43m";
const TERM_BG_BLUE    = "\x1b[44m";
const TERM_BG_MAGENTA = "\x1b[45m";
const TERM_BG_CYAN    = "\x1b[46m";
const TERM_BG_WHITE   = "\x1b[47m";

const logger_console = new Console({
  stdout: __process.stdout,
  stderr: __process.stderr,
  ignoreErrors : true,
  colorMode : 'auto',
  inspectOptions : {
    showHidden : false,
    depth : null,
    // colors : true,
    customInspect : true,
    showProxy : false,
    maxArrayLength : null,
    maxStringLengtha : null,
    breakLength : 80,
    compact : 3,
    sorted : false,
    getters:  false,
    numericSeparator : false,
  },
  groupIndentation : 2,
});

const writeLog = async(...args)=>logger_console.log( ...args );
// const writeLogOptions = {colors:true,depth:null,maxArrayLength:null};
// const writeLog = async(...args)=>[...args,'\n'].forEach(e=>__process.stderr.write(typeof e === 'string' ? e : __util.inspect(e,writeLogOptions)));

const writeDirOptions = {
  colors         : true,
  depth          : null,
  maxArrayLength : null,
};

//1
// const writeDir = async (arg)=>logger_console.dir( recursivelySanitizeAnsi( arg ), writeDirOptions );
//2
const writeDir = async (arg)=>logger_console.dir( arg, writeDirOptions );
//3
// const writeDir = async (arg)=>logger_console.log( JSON.stringify( arg, null, 2), writeDirOptions );

export const MSG_LOG                  = 'log';
export const MSG_SUCCEEDED            = 'succeeded';
export const MSG_WARNING              = 'warning';
export const MSG_ERROR                = 'error';

// module.exports.MSG_SUCCEEDED   = MSG_SUCCEEDED;
// module.exports.MSG_WARNING     = MSG_WARNING;
// module.exports.MSG_ERROR       = MSG_ERROR;

const MSG_TRACE_BEGIN          = 'enter';
const MSG_TRACE_TRACE          = 'trace';
const MSG_TRACE_END            = 'leave';
const MSG_TRACE_END_WITH_ERROR = 'trace-end-with-error';

function formatArgs1( ...args ) {
  return args.length == 1 ? args.pop() : args.map(e=>e!=null?unprevent(e).toString():'(null)').join(' ');
}
function formatArgs2( ...args ) {
  return [...args];
}

const formatArgs = formatArgs2;

export class AsyncContextLogger {
  constructor( name, options ) {
    this.name = name;
    this.options = options;
    this.logList      = [];
    this.logListStack = [];
    this.reportCount = 0;
  }

  output( nargs) {
    this.logList.push({...nargs});
  }

  error(...args) {
    this.logList.push({
      type   : MSG_ERROR,
      value  : formatArgs(...args),
    });
  }

  warn(...args) {
    this.logList.push({
      type : MSG_WARNING,
      value  : formatArgs(...args),
    });
  }

  log(...args) {
    this.logList.push({
      type   : MSG_LOG,
      value  : formatArgs(...args),
    });
  }

  trace(...args) {
    this.logList.push({
      type   : MSG_TRACE_TRACE,
      value  : formatArgs(...args),
    });
  }

  __descendLog() {
    const newLogList = [];
    const currLogList = this.logList;
    currLogList.push( newLogList );
    this.logListStack.push( currLogList );
    this.logList = newLogList;
  }

  __ascendLog() {
    const oldLogList = this.logListStack.pop();
    this.logList = oldLogList;
  }

  enter(name,args) {
    this.output({
      type   : MSG_TRACE_BEGIN,
      name   : name,
      args   : ( unprevent(args) ),
    });

    this.__descendLog();
  }

  leave(name,result) {
    this.__ascendLog();
    this.output({
      type   : MSG_TRACE_END,
      name   : name,
      status : 'succeeded',
      result : ( unprevent( result )),
    });
  }

  leave_with_error(name,result) {
    this.__ascendLog();
    this.output({
      type   : MSG_TRACE_END,
      name   : name,
      status : 'error',
      result : ( unprevent( result )),
    });
  }

  async reportResult( is_successful ) {
    await this.beginReport();
    await this.endReport( is_successful );
  }

  async beginReport( is_successful ) {
    this.reportCount ++;
    this.logList.unshift({type:MSG_LOG, reportCount:this.reportCount });
    await writeLog( '='.repeat(80) );
    await writeLog( 'executeTransaction:Start ' + this.name );
  }

  async endReport( is_successful ) {
    const getLogList = ()=>{
      const name = Array.isArray( this.name ) ? this.name : [ this.name ] ;
      const log = this.logList;
      return { name, log };
    };

    await writeLog( 'executeTransaction:end' );
    await writeLog( );

    if ( is_successful ) {
      await writeLog( TERM_BG_BLUE + '#'.repeat(38) + 'OKAY' + '#'.repeat(39) + TERM_RESET  );

      if ( ( 'suppressSuccessfulReport' in this.options )
        && ( this.options.suppressSuccessfulReport )
      ) {
        // await writeDir( getLogList() );
      } else {
        await writeDir( getLogList() );
      }
      await writeLog();
      await writeLog();
    } else {
      // __process.stderr.write( TERM_BG_RED + '#'.repeat(80) + TERM_RESET + '\n' );
      // __process.stderr.write( TERM_BG_RED + '#'.repeat(37) + 'ERROR' + '#'.repeat(38) + TERM_RESET + '\n' );
      // __process.stderr.write( TERM_BG_RED + '#'.repeat(80) + TERM_RESET + '\n' );
      // __process.stderr.write( this.formatLog({color:false}) );
      // __process.stderr.write( '\n'.repeat(2) );

      await writeLog( TERM_BG_RED + '#'.repeat(80) + TERM_RESET );
      await writeLog( TERM_BG_RED + '#'.repeat(37) + 'ERROR' + '#'.repeat(38) + TERM_RESET );
      await writeLog( TERM_BG_RED + '#'.repeat(80) + TERM_RESET );
      await writeDir( getLogList() );
      await writeLog( );
      await writeLog( );
    }
  }

  // may be unused
  formatLog( nargs={} ) {
    const {
      name = [],
      json = false,
      color = false,
      showHidden = false,
    } = nargs;

    if ( ! Array.isArray( name ) ) {
      name = [ name ];
    }

    if ( json ) {
      return (
        ''
        + JSON.stringify(
          {
            name: [ "<<", this.name, ">>", ... name ].join(' '),
            log : this.logList
          }
          ,(k,v)=>{
            // __process.stderr.write( k + '\n' )
            return filterErrorToJSON( v );
          }
          ,4
        )
        + '\n'
      );
    } else {
      let s;
      s =
        ''
        + __util.inspect(
          {
            name: [ "<<", this.name, ">>", ... name ].join(' '),
            log : this.logList
          },{
            depth: null,
            color: color,
            showHidden : showHidden,
          }
        )
        + '\n'
      s = s.split('\n').map(e=>'  '+e).join('\n') + '\n';
      return s;
    }
  }
  [__util.inspect.custom]( depth, inspectOptions, inspect ) {
    return "{ ... [logger with deep-nested values] ... }";
  }
  toJSON() {
    return "{ ... [logger with deep-nested values] ... }";
  }
}

// module.exports.AsyncContextLogger = AsyncContextLogger;

