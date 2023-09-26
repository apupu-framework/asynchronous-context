
const env = (settings)=>{
  const inenv = settings?.env ?? {};
  const outenv = process.env;
  Object.entries(inenv).map(([k,v])=>{
    if ( typeof k === 'string' || typeof k === 'number' ) {
      outenv[k] = v;
    } else {
      console.warn( `asynchronous-context.env : WANING '${k}' is not a valid key for 'process.env'. ignored.` );
    }
  });
};

module.exports = env;
