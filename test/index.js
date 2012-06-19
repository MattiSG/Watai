require('./helpers');

GLOBAL.VERBOSE = false;

var testFiles = require('./testFilesList');

for (var i = 0; i < testFiles.length; i++)
	require('./' + testFiles[i]);
