
import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { filenameOfSettings, readSettings, asyncReadSettings } from "asynchronous-context/settings.mjs";
import { dotenvFromSettings } from "asynchronous-context/env.mjs";

filenameOfSettings( 'basic.settings.json' );
dotenvFromSettings();

describe( 'test', async ()=>{

  it( 'as 1', async()=>{
    await new Promise((resolve,reject)=>setTimeout(resolve,1000));
    console.log('hello!');
  });

  it( 'as 2', async()=>{
    console.log('hello!');
    console.log(filenameOfSettings);
    console.log(dotenvFromSettings);
    assert.notEqual( filenameOfSettings  ?? null , null  );
    assert.notEqual( dotenvFromSettings  ?? null , null  );
  });

  it( 'as 3', async()=>{
    assert.equal( process.env.FOO , 'HELLO' );
    assert.equal( readSettings()?.hello?.foo , 'bar' );
  });

});
