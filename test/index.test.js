const util   = require( 'node:util' );
const assert = require( 'node:assert/strict' );
const { test, describe, it, before, after }  = require( 'node:test' );
const { schema } = require( 'vanilla-schema-validator' );
const { AsyncContext } = require( '../context.js' );

class TestAsyncContext extends AsyncContext {
  constructor(...args) {
    super(...args);
  }
}
function createContext() {
  return TestAsyncContext.create('hello');
}


async function test_1() {
  this.logger.log( { msg: 'hello' });
  return true;
}
TestAsyncContext.defineMethod( test_1 );

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


describe( 'options test', ()=>{
  it('success and supress true', async ()=>{
    const context = createContext().setOptions({showReport:true,suppressSuccessfulReport:true});
    await context.executeTransaction( async function() {
      return await this.test_1();
    });
  });

  it('success and supress:false', async ()=>{
    const context = createContext().setOptions({showReport:true,suppressSuccessfulReport:false});
    await context.executeTransaction( async function() {
      return await this.test_1();
    });
  });

  it( 'fail and supress:true ', async ()=>{
    await assert.rejects( async ()=>{
      const context = createContext().setOptions({showReport:true,suppressSuccessfulReport:true});
      await context.executeTransaction( async function() {
        assert.fail('kaboom!');
      });
    });
  });

  it( 'fail and supress:false ', async ()=>{
    await assert.rejects( async()=>{
      const context = createContext().setOptions({showReport:true,suppressSuccessfulReport:false});
      await context.executeTransaction( async function() {
        assert.fail('kaboom!');
      });
    });
  });



});

describe( 'prevent-undefined test', ()=>{
  it( 'reference a non-existent argument', async ()=>{
    await assert.rejects( async()=>{
      const context = createContext().setOptions({showReport:true,suppressSuccessfulReport:false});
      await context.executeTransaction( async function() {
        await this.typesafety_input_test2({test:'true'});
      });
    });
  });
});
