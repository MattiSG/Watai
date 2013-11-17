How to contribute to Watai
==========================

If you want to improve Watai, this document will guide you through the necessary environment and provided helpers.

But first of all, thanks for wanting to contribute!  :)


Fork & clone
------------

Simply fork the project, and clone the repository on your machine.

> Go [there](https://help.github.com/articles/fork-a-repo) if you're new to GitHub and need help with this.


Code conventions
----------------

Please read the [Code conventions](https://github.com/MattiSG/Watai/wiki/Code-conventions) prior to coding, and make sure to follow them!


Build tool
----------

See the full [Development environment](https://github.com/MattiSG/Watai/wiki/Development-environment) usage manual.


Shrinkwrap
----------

If you ever update or add a module, you will need to update the [NPM shrinkwrap](https://npmjs.org/doc/shrinkwrap.html) file to lock down dependencies versions (Ruby folks, this is the same as a `Gemfile.lock`).

To do so, simply `cd` to your Watai clone and type:

	npm shrinkwrap

However, when committing, you will notice in the diff that many dependencies are added, not only the ones you added yourself. These are the developer dependencies, and **should never be committed**. Discard the hunk before committing the `npm-shrinkwrap.json` file.


Merging your changes
--------------------

Once your changes are ready, i.e. you made sure:

1. You didn't break anything (`npm run test-exhaustive`).
2. You tested them properly (`npm test --coverage`).
3. You cleanly documented the new code (with `./go doc private`).

…you may open a [pull request](https://help.github.com/articles/using-pull-requests) to ask your new code to be merged in the baseline.

Please make sure the reason why you made these changes is clear in the pull request comments, and please reference any linked issue in these same comments.

Your pull request will then be reviewed, and eventually added to the mainline. Thanks for helping to improve Watai!  :)
