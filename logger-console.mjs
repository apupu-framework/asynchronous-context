
export const create_console_options = ()=>({
  ignoreErrors : true,
  colorMode   : 'auto',
  groupIndentation : 2,
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
});

export const is_customized_console_available = ()=>(
  typeof console?.Console !== 'undefined'
);

export const create_logger_console = (stdout,stderr)=>{
  const Console = console.Console;

  // assume the current environment is node.js
  return new Console({
    stdout,
    stderr,
    ...(create_console_options()),
  });
};


const create_static_logger_console = ()=>{
  if ( is_customized_console_available() ) {
    const {
      stdout = null,
      stderr = null,
    } = process ?? {}

    return create_logger_console( stdout, stderr );
  } else {
    return console;
  }
};

export const logger_console = create_static_logger_console();
