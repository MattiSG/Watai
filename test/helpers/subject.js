/** The library to test, namespacing all public classes.
*/
module.exports = require(process.env.npm_config_coverage	// the trigger is an env variable. See build automation script.
															// we copy NPM’s coverage trigger, even though we might not use NPM to run the coverage report
						? '../../build/TestRight'	// Mocha test coverage generation needs instrumented source, see http://tjholowaychuk.com/post/18175682663
						: '../../src/TestRight');	// default to non-instrumented source
