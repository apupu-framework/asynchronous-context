import path from 'path';
import { promises as async_fs  } from 'fs';
import fs from 'fs';
//const { promises:async_fs } = fs;
import { preventUndefined , unprevent } from 'prevent-undefined' ;
// const util = require('util');

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
export const filenameOfSettings = (...args)=>{
  if ( args.length !== 0 ) {
    if ( typeof args[0] === 'string' ) {
      __filenameOfSettings = args[0];
      console.log( `the main file of 'asynchronous-context/settings' is set to ${__filenameOfSettings}` );

      // Reflect to `proces.env` // (Tue, 10 Oct 2023 13:40:59 +0900)
      process.env[ENV_SETTINGS] = args[0]

    } else {
      throw new Error( 'filenameOfSettings got an invalid argument' );
    }
  }
  return path.join( process.cwd(), __filenameOfSettings );
};
// module.exports.filenameOfSettings = filenameOfSettings;

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

function parseData( data, __filename ) {
  const json = JSON.parse( data );
  // ADDED ( Sat, 07 Oct 2023 15:43:44 +0900)
  json.filenameOfSettings = __filename;
  loggingAfterRead(json);
  return json;
}

export function readSettings() {
  loggingBeforeRead();
  const __filename = filenameOfSettings();
  const data = fs.readFileSync( __filename , 'utf-8');
  return parseData( data, __filename );
}
// module.exports.readSettings = readSettings;


export async function asyncReadSettings() {
  loggingBeforeRead();
  const __filename = filenameOfSettings();
  const data = await async_fs.readFile( __filename , 'utf-8');
  return parseData( data, __filename );
}
// module.exports.asyncReadSettings = asyncReadSettings;









/*
 * (Sat, 07 Oct 2023 15:43:44 +0900)
 *
 * 1. Emulate functionalities of DOTENV.
 *
 * 2. The environment variable `SETTINGS` specifies the filename to read as
 *    settings.
 *
 * 3. `SETTINGS` cannot be overridden via settings file itself.
 *
 */
export const ENV_SETTINGS = 'SETTINGS';
// module.exports.ENV_SETTINGS = ENV_SETTINGS;

const reflectEnvToSettings = ()=>{
  if ( ENV_SETTINGS in process.env ) {
    const filename = process.env.SETTINGS;
    console.log( `a customized settings file is specified '${ filename }'` );
    __filenameOfSettings = filename;
  }
};

/*
 * Integrate `env` to `settings`
 * (Tue, 10 Oct 2023 11:59:37 +0900)
 */
{
  reflectEnvToSettings();
  // config();
}









// const corsSettingsFile = path.join( process.cwd(), 'cors-settings.json' );
// module.exports.corsSettingsFile = corsSettingsFile;

/*
 * const fs = require('fs');
 * fs.readFile( serviceSettingFile , 'utf-8', function callbackReadFile( error, data ) {
 * }
 */
