import { AsyncContext } from './context.mjs' ;

export function createTest( originalTest, createContext, options ) {
  if ( ! createContext ) {
    throw new ReferenceError( '`createContext` must be specified' );
  }
  function testex(...args){
    const first = 0;
    const last = args.length-1;

    const msg =  args.length < 2 ? 'default test' : args[first];
    const fn  = args[last];

    /*
     * === About `delegatorFactory`  ===
     *
     * (Wed, * 25 Sep 2024 18:45:00 +0900)
     *
     * ### The Problem ###
     *
     * The filename of the file which causes an error does not show up in the stacktrace:
     *
     * ```
     *   test at ../../asynchronous-context/test-utils.mjs:25:5
     *   read_timeline_content_confirmDeleted (6.183174ms)
     *     TypeError [Error]: Cannot read properties of undefined (reading 'message_id')
     *         at TKernelContext.<anonymous> (file:///home/ats/libtbc/coretbc/test/basic-kernel.test.mjs:863:37)
     *         at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
     *         at async TKernelContext.<anonymous> (file:///home/ats/libtbc/runtime-typesafety/index.mjs:348:26)
     *         at async TKernelContext.executeTransaction (file:///home/ats/libtbc/asynchronous-context/context.mjs:269:22)
     *         at async args.<computed> (file:///home/ats/libtbc/asynchronous-context/test-utils.mjs:16:16)
     *         at async Test.run (node:internal/test_runner/test:825:9)
     *         at async Suite.processPendingSubtests (node:internal/test_runner/test:533:7)
     *
     *   ats@schizopod:~/libtbc/coretbc/test$ node --test --test-force-exit basic-kernel.test.mjs
     * ```
     *
     * ### The Solution `delegatorFactory` ###
     *
     * `delegatorFactory` property helps tests to show the current stacktrace
     * of the current function not this testex function itself.
     *
     * `delegatorFactory` property should always be a closure object to create
     * a delegator function as following.
     *
     * ```js
     *    delegatorFactory : fn=>function(...args){return fn.apply(this,args)} }
     * ```
     *
     * `delegatorFactory` is a closure function. It is supposed to create a
     * delegator function. For further information about delegation, see
     * [this](https://en.wikipedia.org/wiki/Delegation_pattern).
     *
     * ### Result ###
     *
     * ```
     *  test at basic-kernel.test.mjs:10:265
     *  read_timeline_content_confirmDeleted (6.698337ms)
     *    TypeError [Error]: Cannot read properties of undefined (reading 'message_id')
     *        at TKernelContext.<anonymous> (file:///home/ats/libtbc/coretbc/test/basic-kernel.test.mjs:863:37)
     *        at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
     *        at async TKernelContext.<anonymous> (file:///home/ats/libtbc/runtime-typesafety/index.mjs:348:26)
     *        at async TKernelContext.executeTransaction (file:///home/ats/libtbc/asynchronous-context/context.mjs:269:22)
     *        at async TestContext.<anonymous> (file:///home/ats/libtbc/asynchronous-context/test-utils.mjs:39:18)
     *        at async Test.run (node:internal/test_runner/test:825:9)
     *        at async Suite.processPendingSubtests (node:internal/test_runner/test:533:7)
     * ```
     *
     */
    const {
      delegatorFactory = fn=>function(...args){return fn.apply(this,args)},
    } = options;


    args[last] =
      async (...args2 )=>{
        try {
          return await (
            createContext()
            .setOptions({ ...options, title: msg })
            .executeTransaction( AsyncContext.executeSafely( fn ),  ...args2 ));
        } catch (e) {
          // console.error(e);
          throw e;
        }
      }

    return delegatorFactory( originalTest ) ( ...args );
  }
  return testex;
}

// module.exports.createTest = createTest;

