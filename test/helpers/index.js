var pathsUtils = require('path');
require('mocha');
require('should');
	

exports.config = config = require('../resources/webdriver-config');

var webdriver = require(config.webdriverjsPath);

	
GLOBAL.driver = new webdriver.Builder()
							 .usingServer(config.connectURL)
							 .withCapabilities(config.driverCapabilities)
							 .build();
						  
GLOBAL.TestRight = require('../../src/TestRight');
