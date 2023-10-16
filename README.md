
 Asynchronous-Context
=======================

This module offers the superclass for all objects which are to be created with
**[Kombucha.js][kombucha]** backend framework. This module offers following
functionalities.

- Automatically trace all method invocation and create a trace log as a call
  tree graph.
- Watch all method invocation and validate its input data as JSON objects and
  output data as the return value.

There are currently four modules which inherit `asynchronous-context`.

- [Asynchronous-Context][asynchronous-context]
- [Asynchronous-Context-RPC][asynchronous-context-rpc]
- [Authentication-Context][authentication-context]
- [Database-Postgresql-Context][database-postgresql-context]

In Kombucha.js, these are extended by using [mixin-prototypes][mixin-prototypes]
which offers the multiple-inheritance functionality.

[kombucha]:                          https://github.com/kombucha-js/
[rerenderers]:                       https://github.com/kombucha-js/react-rerenderers/
[react-rerenderers]:                 https://github.com/kombucha-js/react-rerenderers/
[asynchronous-context]:              https://github.com/kombucha-js/asynchronous-context/
[asynchronous-context-rpc]:          https://github.com/kombucha-js/asynchronous-context-rpc/
[prevent-undefined]:                 https://github.com/kombucha-js/prevent-undefined/
[fold-args]:                         https://github.com/kombucha-js/fold-args/
[runtime-typesafety]:                https://github.com/kombucha-js/runtime-typesafety/
[database-postgresql-query-builder]: https://github.com/kombucha-js/database-postgresql-query-builder/
[vanilla-schema-validator]:          https://github.com/kombucha-js/vanilla-schema-validator/
[sql-named-parameters]:              https://github.com/kombucha-js/sql-named-parameters/
[sqlmacro]:                          https://github.com/kombucha-js/sqlmacro/
[mixin-prototypes]:                  https://github.com/kombucha-js/mixin-prototypes/
[authentication-context]:            https://github.com/kombucha-js/authentication-context/
[database-postgresql-context]:       https://github.com/kombucha-js/database-postgresql-context/
[crypto-web-token]:                  https://github.com/kombucha-js/crypto-web-token/
[randomcat]:                         https://github.com/kombucha-js/randomcat/
[beep]:                              https://github.com/kombucha-js/beep/


 API Reference
---------------




 History
----------
(Mon, 25 Sep 2023 17:05:59 +0900)
(Mon, 16 Oct 2023 18:41:16 +0900)
