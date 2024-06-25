#!/bin/env node

import { shutdownDatabaseContext } from 'database-postgresql-context' ;
import repl from 'node:repl';

async function createContext() {
  return (await import( 'coretbc/context' )).createContext().setOptions({ title : 'tBC-CLI', showReport:true });
}

async function tbc(f) {
  const context = await createContext();
  await context.executeTransaction(f);
  await context.logger.reportResult(true);
}

function initializeContext(context) {
  context.tbc = tbc;
  context.createContext = createContext;
}

async function execute () {
  const argv =  process.argv.slice(2);
  if ( argv.length == 0 ) {
    const replInstance = repl.start('> ')
    initializeContext( replInstance.context );
    replInstance.on( 'reset', initializeContext );

  } else {
    try {
      let  f = argv[0];
      try {
        const ff = require('path').join( require( 'process' ).cwd() , f );
        require.resolve(ff)
        f = ff;
      } catch (e){
        // f = require('path').join( require( 'process' ).cwd() , f );
      }
      await tbc( require( f ) );
    } finally {
      shutdownDatabaseContext();
    }
  }
}

execute();
