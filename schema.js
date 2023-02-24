
const symbol = Symbol.for('asynchronous-context');

function init( schema ) {
  if ( symbol in schema ) {
    return schema;
  }
  Object.defineProperty( schema, symbol, {
    value : true,
    enumerable : true,
  });

  schema.t_async_context_options = schema.compile`
    object(
      autoCommit               : boolean(),
      showReport               : boolean(),
      suppressSuccessfulReport : boolean(),
      coloredReport            : boolean(),
      reportMethod             : or(
                                   equals( << 'console' >> ),
                                   equals( << 'stderr' >> ),
                                   equals( << 'stdout' >> ),
                                 ),
      filterError              : function(),
    )`
};

module.exports.init = init;

