
const logger_console = (()=>{
  if ( typeof console.Console !== 'undefined' ) {
    const Console = console.Console;
    const __process = process;

    const set = (t)=>{
      __process.stdout.flush();
      setTimeout( set, t );
    };

    // assume the current environment is node.js
    return new Console({
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
  } else {
    return console;
  }
})();

export { logger_console }
