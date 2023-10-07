
const { readSettings, filenameOfSettings } = require( './settings' );
const ENV_SETTINGS = 'SETTINGS';
{
  if ( ENV_SETTINGS in process.env ) {
    const filename = process.env.SETTINGS;
    console.log( `a customized settings file is specified '${ filename }'` );
    filenameOfSettings( filename );
  }
}

const env = (settings)=>{
  const inenv = settings?.env ?? null;
  const outenv = process.env;

  if ( inenv === null ) {
    throw new Error( `.env entry was not found in ${filenameOfSettings()}` );
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

module.exports = env;

const config = ()=>{
  env( readSettings() );
};

module.exports.config = config;
