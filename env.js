
const { readSettings, filenameOfSettings } = require( './settings' );

const env = (settings)=>{
  const inenv = settings?.env ?? null;
  const outenv = process.env;

  if ( inenv === null ) {
    throw new Error( `.env entry was not found in ${filenameOfSettings()}` );
  }
  Object.entries(inenv).map(([k,v])=>{
    if ( typeof k === 'string' || typeof k === 'number' ) {
      outenv[k] = v;
    } else {
      console.warn( `asynchronous-context.env : WANING '${k}' is not a valid key for 'process.env'. ignored.` );
    }
  });
};

module.exports = env;

const config = ()=>{
  env( readSettings() );
};

module.exports.config = config;
