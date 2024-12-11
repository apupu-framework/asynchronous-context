#!/bin/env node

import { ENV_SETTINGS, asyncReadSettings, readSettings } from './settings.mjs';

let __DONE__dotenvFromSettings = false;

export const env = (settings)=>{
  if ( __DONE__dotenvFromSettings ) {
    return;
  }
  __DONE__dotenvFromSettings = true;

  console.error( 'asynchronous-context/env is activated' );
  const inenv = settings?.env ?? null;
  const outenv = process.env;

  if ( inenv === null ) {
    throw new Error( `.env entry was not found in ${settings.filenameOfSettings}` );
  }

  Object.entries(inenv).map(([k,v])=>{
    if ( typeof k === 'string' || typeof k === 'number' ) {
      if ( k === ENV_SETTINGS ) {
      } else {
        outenv[k] = v;
      }
    } else {
      console.warn( `asynchronous-context.env : WANING '${k}' is not a valid key for 'process.env'. ignored.` );
    }
  });
};

export const dotenvFromSettings = ()=>{
  env( readSettings() );
};


export const config = dotenvFromSettings;

const executedAsAMainScript = async ()=>{
  try {
    const url = await import( 'node:url' );
    const fs  = await import( 'node:fs/promises' );

    const meta_pathname = await fs.realpath(  new URL( import.meta.url           ).pathname );
    const proc_pathname = await fs.realpath(  url.pathToFileURL( process.argv[1] ).pathname );

    if ( meta_pathname === proc_pathname ) {
      // console.log( meta_pathname, proc_pathname );
      return true;
    } else {
      // console.log( meta_pathname, proc_pathname );
      return false;
    }
  } catch ( e ) {
    console.error(e);
    return false;
  }
};
const formatEnv = (s)=>{
  return s.replaceAll( /(\\|\')/g, (s0,s1)=>{
    switch ( s1 ) {
      case "'":
        return "'\\''"
      case "\\":
        // return "\\" + s1;
        return "\\" ;
      default:
        return s1;
    }
  });
};

const showAbout = ()=>{
  console.error( '================================'  );
  console.error( '=== asynchronous-context/env ==='  );
  console.error( '================================'  );
  console.error();
  console.error( 'USAGE : asynchronous-context/env' , '[--eval]' );
};

const generateEvalScript = async ()=>{
  const settings = await asyncReadSettings();
  const env = settings.env ?? {};
  // console.log( settings );
  for ( const [ key,value ] of Object.entries( env ) ) {
    console.log(`${ key }='${ formatEnv( value ) }'; ` );
  }
  for ( const [ key,value ] of Object.entries( env ) ) {
    console.log(`export ${key};` );
  }
};

executedAsAMainScript().then( e=>{
  if ( e ) {
    // console.error( 'env.mjs is loaded as the main script.' );

    if ( process?.argv?.[2] === '--eval' ) {
      return generateEvalScript();
    } else {
      showAbout()
    }
  } else {
    // console.error( 'env.mjs is loaded as a module.',e );
    // showAbout()
  }
});


