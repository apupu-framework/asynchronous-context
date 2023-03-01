const path = require('path');
const fs = require('fs');
const { promises:async_fs } = fs;
const { preventUndefined ,unprevent } = require( 'prevent-undefined' );
const util = require('util');

const settingFile = path.join( process.cwd(),  '.settings.json' );
module.exports.settingFile = settingFile;

// TODO THIS SHOULD BE CONFIGURABLE
// (Wed, 01 Mar 2023 15:31:35 +0900)
const DEBUG = false;


function parseData( data, validator ) {
  const json = JSON.parse( data );
  if ( DEBUG ) {
    console.log( '[asynchronous-context] setting-file.json ',  util.inspect( json ,{colors:true}) );
  }
  return preventUndefined( json, validator );
}

function logging() {
  if ( DEBUG ) {
    console.log( '[asynchronous-context] reading setting file' );
    console.log( '                path : ', settingFile );
    console.log( '               ', new Error().stack.split('\n')[3].trim() );
  }
}

function readSettings( validator ) {
  logging();
  if ( typeof validator !== 'function' ) {
    throw new ReferenceError( `validator must be specified : '${validator}'` );
  }
  const data = fs.readFileSync( settingFile , 'utf-8');
  return parseData( data, validator );;
}

module.exports.readSettings = readSettings;


async function asyncReadSettings( validator ) {
  logging();
  if ( typeof validator !== 'function' ) {
    throw new ReferenceError( `validator must be specified : '${validator}'` );
  }
  const data = await async_fs.readFile( settingFile , 'utf-8');
  return parseData( data, validator );
}
module.exports.asyncReadSettings = asyncReadSettings;




// const corsSettingsFile = path.join( process.cwd(), 'cors-settings.json' );
// module.exports.corsSettingsFile = corsSettingsFile;

/*
 * const fs = require('fs');
 * fs.readFile( serviceSettingFile , 'utf-8', function callbackReadFile( error, data ) {
 * }
 */
