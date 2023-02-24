
const { AsyncContext }      = require('asynchronous-context/context');
const { createContext }      = require('asynchronous-context/context-factory');
const { AsyncContextResult } = require('asynchronous-context/result');

const testdb = require('asynchronous-context/jest-utils').createJestTester( test, createContext, {autoCommit:false, showReport:true,coloredReport:true, reportMethod:'stderr' } );
require( 'asynchronous-context/jest-utils' ).extendExpect( expect );

testdb('test1', async function () {
  expect( ()=>{ throw 'hello'  } ).toCorrectlyThrow( 'hello' );
});

testdb('test2', async function () {
  await expect( async()=>{ throw AsyncContextResult.createErroneous( 'error ') } ).rejects.toCorrectlyThrowAsyncContextResult();
});
