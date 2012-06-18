require('mocha');
require('should');

var pathsUtils = require('path'),
	webdriver = require('/Users/eurogiciel/Documents/Ghost/selenium/build/javascript/webdriver/webdriver');
	

exports.config = config = require('../resources/webdriver-config');
	
GLOBAL.driver = new webdriver.Builder()
						  .usingServer(config.connectURL)
						  .withCapabilities(config.driverCapabilities)
						  .build();

var src = '../../src/';

exports.test = function test(file, suite) {
	require(src + '/' + file);
	
	describe(pathsUtils.basename(file), suite);
}
