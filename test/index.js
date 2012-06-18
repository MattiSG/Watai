require('mocha');
require('should');

var pathsUtils = require('path');


var src = '../src/';

exports.test = function test(file, suite) {
	require(src + file);
	
	describe(pathsUtils.basename(file), suite);
}
