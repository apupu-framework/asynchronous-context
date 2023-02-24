
const { createContext } = require('asynchronous-context/context-factory');
const testdb = require('asynchronous-context/jest-utils').createJestTester( test, createContext, {autoCommit:false, showReport:true,coloredReport:true, reportMethod:'stderr' } );

testdb('two plus two is four', async function () {
  expect(2 + 2).toBe(4);
  return 'successful';
});
