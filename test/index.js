require('./helpers');

/* REMEMBER YOU'LL NEED TO START THE SELENIUM SERVER TO RUN THESE TESTS!
*/

GLOBAL.VERBOSE = false;

var testFiles = require('./testFilesList');

for (var i = 0; i < testFiles.length; i++)
	require('./' + testFiles[i]);
