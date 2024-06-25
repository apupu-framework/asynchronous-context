import assert from 'node:assert/strict';
import { test, describe, it, before, after }  from 'node:test' ;
import { schema } from 'vanilla-schema-validator' ;
import { AsyncContext } from '../context.mjs' ;

class TestAsyncContext extends AsyncContext {
  constructor(...args) {
    super(...args);
  }
}
function createContext() {
  return TestAsyncContext.create().setOptions({title:'hello'}};
}


function defineTest( TestAsyncContext, level, recursive ) {
  const digit = 3;
  const fn0 = (level+0).toString().padStart(digit,'0');
  const fn1 = (level+1).toString().padStart(digit,'0');

  new Function('TestAsyncContext',`
    async function test_${fn0}() {
      this.logger.log({ hello: 'hello world level(${level})' });
      ${recursive ? `await this.test_${fn1}({})` : ''}
      return ${recursive.toString()};
    }
    TestAsyncContext.defineMethod( test_${fn0} );
  `)(TestAsyncContext);
}

(()=>{
  const max = 100;
  for ( let i=0; i<max; i++ ) {
    defineTest( TestAsyncContext, i, i<max-1 );
  }
})();


async function test_1() {
  this.logger.log( { hello: 'hello world' });
  await this.test_2({});
  return true;
}
TestAsyncContext.defineMethod( test_1 );

async function test_2() {
  this.logger.log( { hello: 'foo bar' });
  return true;
}
TestAsyncContext.defineMethod( test_2 );





async function typesafety_input_test(args) {
  this.logger.log( { msg: 'hello' });
  return true;
}
TestAsyncContext.defineMethod( typesafety_input_test, {
  typesafe_input : schema.compile`array( object( test : boolean()))`,
});

async function typesafety_input_test2(args) {
  const { non_existent_argument } = args;
  console.log( non_existent_argument ); // this will never be executed.
  return true;
}
TestAsyncContext.defineMethod( typesafety_input_test2, {
  typesafe_input : schema.compile`array( object() )`,
});


describe( 'logger test', ()=>{
  it('success and supress true', async ()=>{
    const context = createContext().setOptions({showReport:true,suppressSuccessfulReport:false});
    await context.executeTransaction( async function() {
      this.logger.log( {msg:'hello world'});
      return await this.test_1();
    });
  });
  it('success and supress true', async ()=>{
    const context = createContext().setOptions({showReport:true,suppressSuccessfulReport:false});
    await context.executeTransaction( async function() {
      this.logger.log( {msg:'hello world'});
      return await this.test_000();
    });
  });

});
