var pathsUtils = require('path');
require('mocha');
require('should');
	

exports.config = config = require('../config');

var webdriver = require(config.webdriverjsPath);

	
GLOBAL.driver = new webdriver.Builder()
							 .usingServer(config.connectURL)
							 .withCapabilities(config.driverCapabilities)
							 .build();

GLOBAL.TestRight = require(process.env.COVERAGE	// the trigger is an env variable. See build automation script.
						   ? '../../build/TestRight'	// Mocha test coverage generation needs instrumented source, see http://tjholowaychuk.com/post/18175682663
						   : '../../src/TestRight');	// default to non-instrumented source
