const path = require('path');
const fs = require('fs');
const { promises:async_fs } = fs;
const { preventUndefined , unprevent } = require( 'prevent-undefined' );
const util = require('util');

/*
 * `__filenameOfSettings`
 *
 * "settings-file" is a file that contains configurations and settings for an
 * Kombucha.js application instance. The default filename of the file is
 * '.settings.json'.
 *
 * This filename can be changed by `filenameOfSettings()` function.
 * See following.
 */
let __filenameOfSettings = '.settings.json';




/**
 * `filenameOfSettings()`
 *
 * filenameOfSettings() function sets and gets the filename of the default settings-file.
 * When `filenameOfSettings()` is called  with any argument, set the first
 * value on the argument list will be the filename of the default settings-file.
 *
 * A Kombucha.js application instance should always correspond to the existence
 * of `settings-file` and the modification of the contents of the
 * `settings-file` should be reflect to the current application setting.
 *
 * Modifying the default filename should be done before the current application
 * instance starts to initialize; otherwise its consequence is undefined.
 */
const filenameOfSettings = (...args)=>{
  if ( args.length !== 0 ) {
    if ( typeof args[0] === 'string' ) {
      __filenameOfSettings = args[0];
    } else {
      throw new Error( 'filenameOfSettings got an invalid argument' );
    }
  }
  return path.join( process.cwd(), __filenameOfSettings );
};
module.exports.filenameOfSettings = filenameOfSettings;

// const settingFile = path.join( process.cwd(),  '.settings.json' );
// module.exports.settingFile = settingFile;


// TODO THIS SHOULD BE CONFIGURABLE
// (Wed, 01 Mar 2023 15:31:35 +0900)
const DEBUG = false;
function loggingBeforeRead() {
  if ( DEBUG ) {
    console.log( '[asynchronous-context] reading setting file' );
    console.log( '                path : ', filenameOfSettings() );
    console.log( '               ', new Error().stack.split('\n')[3].trim() );
  }
}
function loggingAfterRead(json) {
  if ( DEBUG ) {
    console.log( '[asynchronous-context] setting-file.json ',  util.inspect( json ,{colors:true}) );
  }
  return json;
}

function parseData( data ) {
  const json = JSON.parse( data );
  loggingAfterRead(json);
  return json;
}

function readSettings() {
  loggingBeforeRead();
  const data = fs.readFileSync( filenameOfSettings() , 'utf-8');
  return parseData( data );;
}

module.exports.readSettings = readSettings;


async function asyncReadSettings() {
  loggingBeforeRead();
  const data = await async_fs.readFile( filenameOfSettings() , 'utf-8');
  return parseData( data );
}
module.exports.asyncReadSettings = asyncReadSettings;




// const corsSettingsFile = path.join( process.cwd(), 'cors-settings.json' );
// module.exports.corsSettingsFile = corsSettingsFile;

/*
 * const fs = require('fs');
 * fs.readFile( serviceSettingFile , 'utf-8', function callbackReadFile( error, data ) {
 * }
 */
