Watai
=====

Watai is a **declarative, bottom-up BDD, full-stack web testing** framework.

It is both a test runner engine (i.e. it executes tests) and a set of patterns to make you write **maintainable**, **solid** tests. It is aimed at websites and web applications.

Declarative
-----------

Most tests are written in an _imperative_ fashion: execute some _commands_, then _assert_ some values.

Watai shifts the testing procedure to be much more _declarative_, that is describing _states_ and associated _transitions_ from one state to the other.

Bottom-up BDD
-------------

Watai offers a [Behavior-Driven Development](http://en.wikipedia.org/wiki/Behavior_Driven_Development) frontend, in order to make your test suite a good [boundary object](https://en.wikipedia.org/wiki/Boundary_object) across all your project’s stakeholders, and to make the purpose of testing clearer to everyone, including developers.

However, instead of presenting the usual scenario instrumentation pattern (describe expected feature, write scenario, instrument scenario, write actual testing code), Watai leverages its declarative concepts and generates [business-readable scenarios](http://martinfowler.com/bliki/BusinessReadableDSL.html) from the tests description information.
Hence the “_bottom-up_” phrasing: instead of starting at the human-readable top-level, you finish your testing experience with it.

Full-stack
----------

In web development, testing is often limited to unit level on server-side code, sometimes on client-side code, and rarely on full-stack (or _end-to-end_) functional testing, i.e. in the actual production environment: the browser.
There are many reasons for this, too many for this README.

What is important is that Watai uses Selenium to execute your tests in all browsers, so you can be confident in their results. You don't have to know a thing about Selenium though, as the whole point of Watai is abstracting away those implementation details.

