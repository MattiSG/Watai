Watai
=====

Watai (temporary name) stands for Web Application Testing Automation Infrastructure. It is a **declarative, bottom-up BDD, full-stack web testing** framework.

It is both a test runner engine (i.e. it executes tests) and a set of architectural patterns to make you write **maintainable**, **solid** end-to-end (GUI) tests for browsers. It automatically handles asynchronous operations without any work on your side.

➥ Read more about [what is Watai](https://github.com/MattiSG/Watai/wiki/Definition).

Benefits
--------

1. Creating a safety net to catch regressions.
2. Defining expected behavior and automatically checking its cross-browser consistency.

➥ Read more about [when and how you should use Watai](https://github.com/MattiSG/Watai/wiki/Rationale).

Installing
----------

### Dependencies ###

#### Node & NPM ####

Watai runs as a [Node.js](http://nodejs.org) module with dependencies on external modules. You will therefore need the Node runtime and package manager (NPM).

_Watai has been tested only with Node 0.6, not yet with 0.8. If you already have Node, you should stick with 0.6 for the moment._

**Download the Node+NPM package for your environment:**

- [Precompiled for OS X](http://nodejs.org/dist/v0.6.18/node-v0.6.18.pkg).
- [Precompiled for Windows](http://nodejs.org/dist/v0.6.18/node-v0.6.18.msi).
- Or use a [package manager](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager) to get Node v0.6.

If you’re under Windows and don’t have admin privileges, you might have to define `PATH` as a user environment variable and set it to `<install_drive>:\Program Files\nodejs`.

#### Selenium Server ####

Watai uses Selenium-WebDriver to automate browsers. You will therefore need a Selenium _standalone server_ to send commands to the browsers.

If you’re under OSX and have [Homebrew](http://mxcl.github.com/homebrew/), simply `brew install selenium-server-standalone` and start it with the command given at the end of the “Caveats” section.

Otherwise, [download the JAR](https://code.google.com/p/selenium/downloads/detail?name=selenium-server-standalone-2.24.1.jar) and start it (preferably in the background):

	java -jar path/to/downloaded/selenium-server-standalone.jar

This will output many `INFO` lines over a few seconds. You know it is done when it says:

	… INFO - Started org.openqa.jetty.jetty.Server@…

You will obviously need Java (≥ 1.5). If you don’t have it yet (but you probably wouldn’t be reading this README), [download it now](http://java.com/download).

#### Optional: ChromeDriver ####

If you want to [test with Chrome](https://github.com/MattiSG/Watai/wiki/Testing-with-Chrome) (or with other browsers), you will have to install some additional software.

This is completely optional, and you will be operational faster if you do the tutorial with Firefox. The testing itself will be a bit slower, but you may come back to add Chrome later on if you like Watai  :)

### Package ###

Once you have both Node 0.6 and a Selenium standalone server, you can consider installing Watai itself.

As long as we’re in early alpha, the package won’t be published on the NPM public registry. You will therefore have to install Watai with one of the following commands:

#### POSIX-compliant OS: global install (easiest) ####

	sudo npm install -g https://github.com/MattiSG/Watai/tarball/master

NPM will automatically create the `watai` alias for you. If you decide you don’t want to use Watai later on, simply `npm uninstall -g` it.

#### POSIX-compliant OS: local install ####

	cd choose/your/install/folder
	npm install https://github.com/MattiSG/Watai/tarball/master
	alias watai="$(pwd)/node_modules/watai/go"

This will create a `node_modules` folder with all dependencies in the current directory. A good way to give Watai a quick look if you’re afraid of `sudo`ing.

#### Under Windows ####

	npm install -g https://github.com/MattiSG/Watai/tarball/master
	doskey watai=node "%APPDATA%\npm\node_modules\watai\src" $*

#### From behind a proxy ####

If your proxy configuration prevents you from using `npm install` properly (i.e. you get `ERRTIMEOUT` errors), download the latest _“Watai with NPM dependencies”_ package from the [Downloads](https://github.com/MattiSG/Watai/downloads) tab, and `alias` / `doskey $*` the name `watai` to `node path/to/downloaded/folder/src` (mark the `/src` at the end!).

### Then, [get started with Watai](https://github.com/MattiSG/Watai/wiki/Introduction)! ###
