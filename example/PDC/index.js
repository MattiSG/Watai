var webdriver = require('/Users/eurogiciel/Documents/Ghost/selenium/build/javascript/webdriver/webdriver'),
	growl = require('growl'),
	config = require('./config');


var driver = new webdriver.Builder()
						.usingServer('http://localhost:4444/wd/hub')
						.withCapabilities(config.driverCapabilities)
						.build();

driver.get(config.baseURL)


var TR = require('../../src/TestRight.js')(driver);

var loginFeature = require('./LoginFeature')(TR, driver);

var displayResults = function displayResults(succeeded) {
	if (succeeded) {
		console.log('✔ ' + loginFeature.description);
		growl('Success!');
	} else {
		console.log('✘ ' + loginFeature.description + ' fails');
		growl('Fail!', { priority: 4 });
	}
}

var evaluateFeature = function evaluateFeature(feature) {
	try {
		feature.test(displayResults);
	} catch (error) {
		growl('Crash!\n' + error, { priority: 4 });
		throw error;
	} finally {
		driver.quit();
	}
}

driver.get(config.baseURL).then(evaluateFeature.bind(this, loginFeature));
