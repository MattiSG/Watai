How to contribute to Watai
==========================

If you want to improve Watai, this document will guide you through the necessary environment and provided helpers.

But first of all, thanks for wanting to contribute!  :)


Fork & clone
------------

Simply [fork the project and clone the repository](https://help.github.com/articles/fork-a-repo) on your machine, and install the developer dependencies.

```shell
cd path/to/watai/clone
npm install --no-shrinkwrap
```


Code conventions
----------------

Please read the [Code conventions](https://github.com/MattiSG/Watai/wiki/Code-conventions) prior to coding. An [`editorconfig`](http://editorconfig.org/) file is provided, as well as an [automated style checker](https://github.com/mdevils/node-jscs).


Build tool
----------

Build processes are mostly automated through [npm scripts](https://www.npmjs.org/doc/cli/npm-run-script.html).

Most are documented here, and you can get a full list by running `npm run`.


### Test

Test runner: [Mocha](http://visionmedia.github.com/mocha/).

	npm test

You can execute a subset of tests only if you're working on a specific part. For example, considering you're adding tests to controllers:

	[node_modules/.bin/]mocha test [--watch] test/unit/controller


#### Coverage

Coverage information is provided by [Istanbul](https://github.com/yahoo/istanbul). You can obtain it with:

	npm test --coverage


#### Exhaustive mode

Since Watai's integration tests (exit codes checks, CLI options) are long and little prone to fail suddenly, they are not executed in the default `test` command.

To execute all tests, including the longer ones, to ensure no regression was made, use the following command:

	npm run test-exhaustive


### Documentation generation

Documentation generator and syntax: [JSdoc](http://usejsdoc.org).

	npm run doc

You will find the generated documentation as HTML files in the `doc/api` folder. Open `doc/api/index.html` to start.

If you're hacking on the core of Watai rather than a plugin, you can use:

	npm run doc-private


Distribution
------------

### Shrinkwrap

If you ever update or add a module, you will need to update the [NPM shrinkwrap](https://npmjs.org/doc/shrinkwrap.html) file to lock down dependencies versions (Ruby folks, this is the same as a `Gemfile.lock`).

To do so, simply `cd` to your Watai clone and type:

	npm shrinkwrap

However, when committing, you will notice in the diff that many dependencies are added, not only the ones you added yourself. These are the developer dependencies, and **should never be committed**. Discard the hunk before committing the `npm-shrinkwrap.json` file.


### Examples

When updating examples, since this wiki uses some, new archives should be generated using `go export-examples`.

Similarly, for tagged releases, an archive with all dependencies should be exported, in order to allow for an easy install in environments with no fully functional NPM (i.e. behind corporate proxies). Such an archive is created by:

	./go dist

Unless you're an administrator of the main repository, you typically won't need this command.


Merging your changes
--------------------

Once your changes are ready, i.e. you made sure:

1. You didn't break anything and respected the styleguide (`npm run test-exhaustive`).
2. You tested them properly (`npm test --coverage`).
3. You cleanly documented the new code (with `./go doc private`).

…you may open a [pull request](https://help.github.com/articles/using-pull-requests) to ask your new code to be merged in the baseline.

Please make sure the reason why you made these changes is clear in the pull request comments, and please reference any linked issue in these same comments.

Your pull request will then be reviewed, and eventually added to the mainline. Thanks for helping to improve Watai!  :)
