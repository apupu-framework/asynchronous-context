
const { AsyncContext }      = require('async-context/context');
const { createContext }      = require('async-context/context-factory');
const { AsyncContextResult } = require('async-context/result');

const testdb = require('async-context/jest-utils').createJestTester( test, createContext, {autoCommit:false, showReport:true,coloredReport:true, reportMethod:'stderr' } );
require( 'async-context/jest-utils' ).extendExpect( expect );

testdb('test1', async function () {
  expect( ()=>{ throw 'hello'  } ).toCorrectlyThrow( 'hello' );
});

testdb('test2', async function () {
  await expect( async()=>{ throw AsyncContextResult.createErroneous( 'error ') } ).rejects.toCorrectlyThrowAsyncContextResult();
});
