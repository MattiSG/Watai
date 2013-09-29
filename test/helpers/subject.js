var loadPath = '../../src';

/** The library to test, namespacing all public classes.
*/
var result = require(loadPath + '/Watai');

result.path = loadPath;	// append this to `result` instead of using another key to avoid having to rewrite all `require`s in tests

module.exports = result;
