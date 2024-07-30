
// const util = require( 'node:util' );
// const process = require( 'process' );
import { preventUndefined, unprevent } from 'prevent-undefined' ;
import { logger_console ,create_logger_console } from "./logger-console.mjs" ;

const sanitizeAnsi = (s)=>
  typeof s ==='string' ? s.replace( /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '' ) : s;

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


const writeLog = async(...args)=>logger_console.log( ...args );

const writeDirOptions = {
  colors         : true,
  depth          : null,
  maxArrayLength : null,
};

const writeDir = async (arg)=>logger_console.dir( arg, writeDirOptions );


class ConsoleLogger {
  async beginReport( nargs ) {
    const {
      name,
    } = nargs;
    await writeLog( '='.repeat(80) );
    await writeLog( 'executeTransaction:start ' + name );
  }

  async endReport( nargs ) {
    const {
      is_successful,
      name,
      log,
      suppressSuccessfulReport,
    } = nargs;

    const result = { name, log };

    await writeLog( 'executeTransaction:end' );
    await writeLog( '='.repeat(80) );
    await writeLog( );

    if ( is_successful ) {
      await writeLog( TERM_BG_BLUE + '#'.repeat(38) + 'OKAY' + '#'.repeat(39) + TERM_RESET  );

      if ( suppressSuccessfulReport ) {
        //
      } else {
        await writeDir( result  );
      }
      await writeLog();
      await writeLog();
    } else {
      await writeLog( TERM_BG_RED + '#'.repeat(80) + TERM_RESET );
      await writeLog( TERM_BG_RED + '#'.repeat(37) + 'ERROR' + '#'.repeat(38) + TERM_RESET );
      await writeLog( TERM_BG_RED + '#'.repeat(80) + TERM_RESET );
      await writeDir( result );
      await writeLog( );
      await writeLog( );
    }
  }
}
const CONSOLE_LOGGER = new ConsoleLogger();

class DummyLogger {
  async beginReport(nargs) {
  }
  async endReport(nargs) {
  }
}
const DUMMY_LOGGER = new DummyLogger();

const random_token_arr = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
];
const random_token = (length,s)=>{
  if ( ! length ) {
    return '';
  } else if ( typeof s === 'string' ) {
    if (s.length < length )  {
      return random_token(
        length,
        s + random_token_arr[ String( Math.floor( Math.random() * random_token_arr.length ) ) ]
      );
    } else {
      return s;
    }
  } else {
    return random_token( length, '' );
  }
};


const pad = (l,v)=>{
  const s = String(v).padStart(l,'0')
  return s.substring( s.length - l );
};
const to_yyyymmdd_hhmmss = (d)=>(
  ''
  + pad( 4, d.getFullYear()     )
  + pad( 2, d.getMonth()    + 1 )
  + pad( 2, d.getDate()         )
  + '-'
  + pad( 2, d.getHours()        )
  + pad( 2, d.getMinutes()      )
  + pad( 2, d.getSeconds()      )
  + '-'
  + pad( 3, d.getMilliseconds() )
  + '-'
  + pad( 4, random_token(4)      )
);

const to_dirname = (d)=>(
  ''
  + pad( 4, d.getFullYear()     )
  + '/'
  + pad( 2, d.getMonth()    + 1 )
  + '/'
  + pad( 2, d.getDate()         )
  + '/'
  + pad( 2, d.getHours()        )
  + '/'
  + pad( 2, d.getMinutes()      )
);

const to_filename = (d)=>(
  ''
  + to_yyyymmdd_hhmmss( d )
);

const append_separator = (prefix, s,postfix)=>{
  if ( s ) {
    return `${prefix}${s}${postfix}`;
  } else {
    return s;
  }
};


const generate_default_filename = (path, t, options )=>{
  const {
    logger_output_dir = './',
    logger_output_filename_prefix  = '',
    logger_output_filename_postfix = '',
  } = options;

  const now = t ?? new Date();
  const logger_filename =
    ''
    + append_separator( '',  logger_output_filename_prefix , '-' )
    + to_filename( now )
    + append_separator( '-', logger_output_filename_postfix, '' )
    + '.js';
  const logger_dirname  = to_dirname ( now );
  const logger_output_filename = path.join( logger_output_dir, logger_dirname, logger_filename );
  return logger_output_filename;
};


class FileLogger {
  constructor(options={}){
    if ( typeof options !== 'object' ) {
      throw new TypeError( 'options is not an object' );
    }
    this.options                        = options;
    // this.logger_output_dir              = options?.logger_output_dir      ?? "./";
    // this.logger_output_filename         = options?.logger_output_filename ?? null;
    this.modules =null;
  }

  async init_modules_lazily() {
    if ( ! this.modules ) {
      const result = await Promise.all([
        import( "node:path" ),
        import( "node:fs" ),
        import( "node:fs/promises" ),
      ]);

      this.modules = {
        path : result[0],
        fs   : result[1],
        fsp  : result[2],
      };
    }
  }

  async beginReport(nargs) {
  }

  async endReport(nargs) {
    const {
      is_successful,
      name,
      log,
      suppressSuccessfulReport,
    } = nargs;

    await this.init_modules_lazily();

    if ( ! this?.options?.logger_output_filename ) {
      this.options.logger_output_filename =
        generate_default_filename( this.modules.path, null, this.options );
    }

    // console.log( '2ObonT+kh51genRM606Azg==', 'this.modules', this.modules );

    const logger_output_dirname = this.modules.path.dirname( this.options.logger_output_filename );

    // console.log( logger_output_dirname, this.options.logger_output_filename );

    await this.modules.fsp.mkdir( logger_output_dirname, { recursive : true, mode:0o777 } );

    const a_write_stream = this.modules.fs.createWriteStream( this.options.logger_output_filename, {flags:'w' } );
    try {
      const c = create_logger_console( a_write_stream, a_write_stream );
      c.dir( log, {
        colors         : false,
        depth          : null,
        maxArrayLength : null,
      });
    } finally {
      a_write_stream.end();
    }
  }
}

const select_logger_handler = (options)=>{
  if ( options?.showReport ) {
    switch ( options?.logger_report_method ) {
      case 'console' : {
        return CONSOLE_LOGGER;
      };
      case 'ignore' : {
        return DUMMY_LOGGER;
      };
      case 'file' : {
        return new FileLogger(options);
      };
      default : {
        return CONSOLE_LOGGER;
      };
    }
  } else {
    return DUMMY_LOGGER;
  }
};



export const MSG_LOG                  = 'log';
export const MSG_SUCCEEDED            = 'succeeded';
export const MSG_WARNING              = 'warning';
export const MSG_ERROR                = 'error';

const MSG_TRACE_BEGIN          = 'enter';
const MSG_TRACE_TRACE          = 'trace';
const MSG_TRACE_END            = 'leave';
const MSG_TRACE_END_WITH_ERROR = 'trace-end-with-error';

function formatArgs1( ...args ) {
  return args.length == 1 ? args.pop() : args.map( e=>e!=null ? unprevent(e).toString():'(null)').join(' ');
}
function formatArgs2( ...args ) {
  return [...args];
}
const formatArgs = formatArgs2;
const now = ()=>new Date();

export class AsyncContextLogger {
  name   = 'AsyncContextLogger';
  options = {};
  logger_handler = null;
  // logger_handler = DUMMY_LOGGER;
  constructor( name, options ) {
    this.setOptions( name, options );
    this.reset();
  }

  setOptions( name, options ) {
    this.name           = name    ?? this.name;
    this.options        = options ?? this.options;
    this.logger_handler = select_logger_handler( options );
  }

  reset() {
    this.logList        = [];
    this.logListStack   = [];
    this.reportCount    = 0;
  }

  #__is_tron = true;
  tron() {
    this.#__is_tron = true;
  }

  troff() {
    this.#__is_tron = false;
  }

  is_tron() {
    return this.#__is_tron;
  }

  output( elem ) {
    if ( this.#__is_tron ) {
      if ( ! elem.type ) {
        elem.type = 'unknown';
      }
      this.logList.push( elem );
    } else {
      return;
    }
  }

  error(...args) {
    this.output({
      type   : MSG_ERROR,
      time   : now(),
      value  : formatArgs(...args),
    });
  }

  warn(...args) {
    this.output({
      type   : MSG_WARNING,
      time   : now(),
      value  : formatArgs(...args),
    });
  }

  log(...args) {
    this.output({
      type   : MSG_LOG,
      time   : now(),
      value  : formatArgs(...args),
    });
  }

  trace(...args) {
    this.output({
      type   : MSG_TRACE_TRACE,
      time   : now(),
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
      time   : now(),
      name   : name,
      args   : ( unprevent(args) ),
    });

    this.__descendLog();
  }

  leave(name,result) {
    this.__ascendLog();
    this.output({
      type   : MSG_TRACE_END,
      time   : now(),
      name   : name,
      status : 'succeeded',
      result : ( unprevent( result )),
    });
  }

  leave_with_error(name,result) {
    this.__ascendLog();
    this.output({
      type   : MSG_TRACE_END,
      time   : now(),
      name   : name,
      status : 'error',
      result : ( unprevent( result )),
    });
  }

  async reportResult( is_successful ) {
    await this.beginReport({ is_successful });
    await this.endReport(  { is_successful });
  }

  async beginReport(nargs) {
    await this?.logger_handler?.beginReport({
      name : this.name,
      log  : this.logList,
      ...this.options,
      ...nargs
    });
  }

  async endReport(nargs) {
    await this?.logger_handler?.endReport({
      name : this.name,
      log  : this.logList,
      ...this.options,
      ...nargs,
    });
  }
}

// module.exports.AsyncContextLogger = AsyncContextLogger;

