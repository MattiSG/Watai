require('./helpers');

/* Run this file with `mocha`, not `node`.
*REMEMBER YOU'LL NEED TO START THE SELENIUM SERVER TO RUN THESE TESTS!
*/

var testFiles = require('./resources/testFilesList');

for (var i = 0; i < testFiles.length; i++)
	require('./' + testFiles[i]);
