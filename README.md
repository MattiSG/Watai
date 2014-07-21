Watai
=====

Watai _(Web Application Testing Automation Infrastructure)_ is a **declarative, bottom-up BDD, full-stack web testing** framework.

It is both a test runner engine (i.e. it executes tests) and a set of architectural patterns to make you write **maintainable**, **solid** end-to-end (GUI) tests. It automatically handles asynchronous operations without any work on your side.

The tests you write will automate navigation on your webapp through actual browsers, just like an actual user would.

➥ Read more about [what is Watai](https://github.com/MattiSG/Watai/wiki/Definition).

Benefits
--------

1. Creating a safety net to catch regressions in your webapp.
2. Checking cross-browser consistency automatically.
3. Defining expected behavior and testing it at user level, not in isolation as in unit tests.

➥ Read more about [when and how you should use Watai](https://github.com/MattiSG/Watai/wiki/Rationale).

Status
------

### Watai is currently beta-level software ###

This means that its stability and feature set are evolving. It is constantly improving, and a high level of quality control is applied to its development. But mistakes can always happen.

[![Code Climate](https://codeclimate.com/github/MattiSG/Watai.png)](https://codeclimate.com/github/MattiSG/Watai)

We are currently using Watai in a big live project, and at least two other teams do so. You are highly encouraged to try out Watai and see if it fits your needs. Getting started and writing your first test should take you around 15 minutes, and the results should get you quite excited  :)

If anything goes wrong, please open an issue, and I'll do my best to get you out of trouble!

### Versioning ###

[SemVer](http://semver.org/) is followed to convey the state of the software through version numbers.

You can rely on the fact that the syntax you write your tests in won't change until a minor version number (the `y` in `x.y.z`) is updated. Versions not sufficiently field-tested will be suffixed with `-alpha`.

Installing
----------

This installation guide assumes a POSIX-compliant OS, such as Mac OS X or Linux. If you're under Windows, see the [Windows installation guide](https://github.com/MattiSG/Watai/wiki/Windows-installation).

### Dependencies ###

#### Node & NPM ####

Watai runs as a [Node.js](http://nodejs.org) module. You will therefore need the Node runtime (≥0.6.8 <0.11) and package manager (NPM ≥ 1.2).

If you’re under OSX and have [Homebrew](http://mxcl.github.com/homebrew/):

	brew install node

Otherwise, [download](http://nodejs.org/download) the Node+NPM package for your environment if you don't already have it.

#### Selenium Server ####

Watai uses Selenium-WebDriver to automate browsers. You will therefore need a Selenium _standalone server_ to send commands to the browsers.

If you’re under OSX and have [Homebrew](http://mxcl.github.com/homebrew/):

	brew install selenium-server-standalone

…and start it with the command given at the end of the “Caveats” section.

Otherwise, [download the latest JAR](https://code.google.com/p/selenium/downloads/list?can=3&q=selenium-server-standalone) and start it (preferably in the background):

	java -jar path/to/downloaded/selenium-server-standalone.jar

This will output many `INFO` lines over a few seconds. You know it is done when it says:

	… INFO - Started org.openqa.jetty.jetty.Server@…

You will obviously need Java (≥ 1.5). If you don’t have it yet (but you probably wouldn’t be reading this README), [download it now](http://java.com/download).

#### Optional: ChromeDriver ####

If you want to [test with Chrome](https://github.com/MattiSG/Watai/wiki/Testing-with-Chrome) (or with other browsers), you will have to install some additional software.

This is completely optional, and you will be operational faster if you do the tutorial with Firefox. The testing itself will be a bit slower, but you may come back to add Chrome later on if you like Watai  :)

### Package ###

Once you have both Node and a Selenium server, you can consider installing Watai itself.

#### Global install (easiest) ####

	sudo npm install -g watai

NPM will automatically create the `watai` alias for you. If you decide you don’t want to use Watai later on, simply `npm uninstall -g` it.

#### Local install ####

	cd choose/your/install/folder
	npm install watai
	alias watai="$(pwd)/node_modules/watai/go"

This will create a `node_modules` folder with all dependencies in the current directory. A good way to give Watai a quick look if you’re afraid of `sudo`ing.

#### From behind a proxy ####

If your proxy configuration prevents you from using `npm install` properly (i.e. you get `ERRTIMEOUT` errors), download the latest Watai **with NPM dependencies** package from the [Releases](https://github.com/MattiSG/Watai/releases) tab, unzip it and:

	alias watai='node path/to/unzipped/folder/src'

Note the `/src` at the end!

### Validation ###

Let’s make sure you’re fully ready to use Watai by typing:

	watai --installed

### Then, [get started with Watai](https://github.com/MattiSG/Watai/wiki/Tutorial)! ###

- - - - - - -

License
-------

The code for this software is distributed under an [AGPL license](http://www.gnu.org/licenses/agpl.html). That means you may use it to test any type of software, be it free or proprietary. But if you make any changes to the test engine itself (i.e. this library), even if it is not redistributed and provided only as a webservice, you have to share them back with the community. Sounds fair?  :)

Contact the author if you have any specific need or question regarding licensing.
