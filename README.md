Watai
=====

Watai (temporary name) is a **declarative, bottom-up BDD, full-stack web testing** framework.

It is both a test runner engine (i.e. it executes tests) and a set of architectural patterns to make you write **maintainable**, **solid** end-to-end (GUI) tests for browsers.

→ [Read more about what is Watai](https://github.com/MattiSG/Watai/wiki/Definition).

Benefits
--------

1. Creating a safety net to catch regressions.
2. Defining expected behavior and automatically checking its cross-browser consistency.

→ [Read more about when and how you should use Watai](https://github.com/MattiSG/Watai/wiki/Rationale).

Installing
----------

### Dependencies ###

#### Node & NPM ####

Watai runs as a [Node.js](http://nodejs.org) module, and has dependencies on other modules.

You will therefore need the Node runtime, and NPM to manage dependencies, which [comes with Node](http://npmjs.org/doc/README.html#Super-Easy-Install).

_Watai has been tested only with Node 0.6, not yet with 0.8. If you already have Node, you should stick with 0.6 for the moment._

**Download the Node package for your environment:**
- Precompiled for [OS X](http://nodejs.org/dist/v0.6.18/node-v0.6.18.pkg).
- Precompiled for [Windows](http://nodejs.org/dist/v0.6.18/node-v0.6.18.msi).
- Or use a [package manager](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager) to get Node v0.6.

#### Selenium Server ####

Watai uses Selenium-WebDriver to automate browsers. You will therefore need a Selenium _standalone server_ to send commands to the browsers.

If you’re under OSX and have [Homebrew](http://mxcl.github.com/homebrew/), simply `brew install selenium-server-standalone` and start it with the command given at the end of the “Caveats” section.

Otherwise, [download the JAR](https://code.google.com/p/selenium/downloads/detail?name=selenium-server-standalone-2.24.1.jar) (_server-standalone_, ok?) and start it in the background:

	java -jar path/to/downloaded/selenium-server-standalone.jar &

### Package ###

Once you have both Node 0.6 and a Selenium standalone server, you can consider installing Watai itself.

As long as we’re in early alpha, the package won’t be published on the NPM public registry. You will therefore have to install Watai with the following command:

	npm install -g https://github.com/MattiSG/Watai/tarball/master
