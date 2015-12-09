Watai
=====

Watai _(Web Application Testing Automation Infrastructure)_ is a **declarative web integration testing** framework.

[![Latest version](https://img.shields.io/github/release/MattiSG/Watai.svg)](https://github.com/MattiSG/Watai/releases)
[![Code Climate](https://codeclimate.com/github/MattiSG/Watai.png)](https://codeclimate.com/github/MattiSG/Watai)
[![Inline docs](http://inch-ci.org/github/MattiSG/Watai.svg?branch=master)](http://inch-ci.org/github/MattiSG/Watai)

It is both a test runner engine and a set of architectural patterns that help [front-end ops](http://www.smashingmagazine.com/2013/06/front-end-ops/)-conscious developers write **maintainable** and **solid** end-to-end tests. These tests automate web application navigation through actual browsers, checking whether such interactions present the expected information to the end users along the way, including through asynchronous operations.

This allows to automate demonstration of features, to detect regressions when updating code and, since the same tests can be run in almost any browser, to easily check cross-browser functional support.

➥ Read more about [what is Watai](https://github.com/MattiSG/Watai/wiki/Definition).

➥ Or watch a 4-minutes introduction:
[![We're bad at web integration testing](http://img.youtube.com/vi/fLP3NKUsx3k/3.jpg)](https://youtu.be/fLP3NKUsx3k?t=17s)


What a test looks like
----------------------

Have a look at a [simple example](https://github.com/MattiSG/Watai/tree/master/example/DuckDuckGo) or an [advanced example](https://github.com/MattiSG/Watai/tree/master/example/DuckDuckGo%20-%20advanced%20matchers)… or look at [real-world users](https://github.com/MattiSG/Watai/wiki/Examples)!

> Our 10-minutes [tutorial](https://github.com/MattiSG/Watai/wiki/Tutorial) walks you through an example to introduce all concepts. You don't even need to install the software to do it.


Installing
----------

	npm install --global selenium-server watai

> If you're not familiar with `npm install`, read the full [installation guide](https://github.com/MattiSG/Watai/wiki/Installing)  :)

Let’s make sure you’re fully ready to use Watai by typing:

	watai --installed

### Then, [get started with Watai](https://github.com/MattiSG/Watai/wiki/Tutorial)!


Strengths
---------

- Enforcement of a highly decoupled, [component](http://addyosmani.com/blog/the-webs-declarative-composable-future/)-based architecture for maintainable tests.
- Out-of-the-box support for async operations (AJAX…), as well as much more resilience than WebDriver, whose failures are wrapped.
- Simple cascading configuration makes sharing tests across environments (dev, CI, prod) very easy.
- Aiming for helpful error messages.
- [High quality code](https://codeclimate.com/github/MattiSG/Watai) and [developer documentation](http://inch-ci.org/github/MattiSG/Watai), so that you can _actually_ fix things or add functionality without depending on the original developer.

➥ Read more about [how Watai is different](https://github.com/MattiSG/Watai/wiki/Comparison) from other integration testing tools.

- - - - - - -

License
-------

The code for this software is distributed under an [AGPL license](http://www.gnu.org/licenses/agpl.html). That means you may use it to test any type of software, be it free or proprietary. But if you make any changes to the test engine itself (i.e. this library), even if it is not redistributed and provided only as a webservice, you have to share them back with the community. Sounds fair?  :)

Contact the author if you have any specific need or question regarding licensing.
