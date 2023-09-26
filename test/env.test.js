
const test = require( 'node:test' );

const assert = require( 'node:assert/strict' );

const settings = {
  env : {
    foo : 'FOO',
    bar : {
      foo : 'FOO',
      bar : 500,
      toString() {
        return 'BAR';
      },
    },
  },
};

test.describe( 'test', ()=>{
  test.it( '1',  ()=>{
    const env = require( '../env' );
    env( settings );

    assert.equal( process.env.foo        ,'FOO'    );
    assert.equal( process.env.bar        ,'BAR'    );
    assert.equal( typeof process.env.foo ,'string' );
    assert.equal( typeof process.env.bar ,'string' );
  });
});



console.log( 'succeeded' );
