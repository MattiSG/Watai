var loadPath = (process.env.npm_config_coverage	// the trigger is an env variable. See build automation script.
												// we copy NPM’s coverage trigger, even though we might not use NPM to run the coverage report
				? '../../coverage'	// Mocha test coverage generation needs instrumented source, see http://tjholowaychuk.com/post/18175682663
				: '../../src');		// default to non-instrumented source

/** The library to test, namespacing all public classes.
*/
var result = require(loadPath + '/Watai');

result.path = loadPath;	// append this to `result` instead of using another key to avoid having to rewrite all `require`s in tests

module.exports = result;
