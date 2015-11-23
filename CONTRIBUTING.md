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

	npm run test-unit test/unit test/functional

You can execute a subset of tests only if you're working on a specific part. For example, considering you're adding tests to controllers:

	npm run test-unit [--watch] test/unit/controller


#### Coverage

Coverage information is provided by [Istanbul](https://github.com/gotwarlost/istanbul). It is always output after tests. You can check the thresholds with:

	npm run test-coverage


#### Exhaustive mode

Run all Watai tests, including CLI options and exit codes checks, which are much longer as they imply several browser startups and kills:

	npm test


### Documentation generation

Documentation generator and syntax: [JSdoc](http://usejsdoc.org).

	npm run doc

You will find the generated documentation as HTML files in the `doc/api` folder. Open `doc/api/index.html` to start.

If you're hacking on the core of Watai rather than a plugin, you can use:

	npm run doc-private


Packaging
---------

### Changelog

Please update the `Changelog.md` at the root of the project for every change you bring.
Remember we use [SemVer](http://semver.org).


### Shrinkwrap

If you ever update or add a module, you will need to update the [NPM shrinkwrap](https://npmjs.org/doc/shrinkwrap.html) file to lock down dependencies versions (Ruby folks, this is the same as a `Gemfile.lock`).

To do so, simply `cd` to your Watai clone and type:

	npm shrinkwrap

However, when committing, you will notice in the diff that many dependencies are added, not only the ones you added yourself. These are the developer dependencies, and **should never be committed**. Discard the hunk before committing the `npm-shrinkwrap.json` file.


Merging your changes
--------------------

Once your changes are ready, i.e. you made sure:

1. You didn't break anything, tested properly, and respected the styleguide (`npm test`).
2. You cleanly documented the new code (`npm run doc-private`).

…you may open a [pull request](https://help.github.com/articles/using-pull-requests) to ask your new code to be merged in the baseline.

Please make sure the reason why you made these changes is clear in the pull request comments, and please reference any linked issue in these same comments.

Your pull request will then be reviewed, and eventually added to the mainline. Thanks for helping to improve Watai!  :)


Distribution
------------

### Versioning

We use [Semantic Versioning](http://semver.org) to convey compatibility information through version numbers. If merged changes in `master` impact the end user in any way, the version number should be updated as specified by [SemVer](http://semver.org).

To ensure quality, we use field testing before publishing official versions. Thus, when the version number is updated, it should be sufficed by `-alpha` or `-beta` upon merge, with a numeric indicator incremented on each later merge. The switch from alpha to beta happens on feature freeze, decided by the maintainers. The switch from beta to official release happens after 2 weeks without issues.

> This means there could be a time within which both a beta and an alpha for the next version are both available.

`master` is always the edge version. You can access stable versions through tags, as listed in the [Releases](https://github.com/MattiSG/Watai/releases) tab. Unstable versions are distributed under the `edge` NPM [tag](https://docs.npmjs.com/cli/dist-tag).


### Publishing

```shell
npm version  # remember to use semver.org
npm publish
npm pack
```

Copy the changelog entries and upload the resulting pack to the [Releases](https://github.com/MattiSG/Watai/releases) tab of GitHub.
