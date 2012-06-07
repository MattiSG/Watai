

var webdriver = require('/Users/eurogiciel/Documents/Ghost/selenium/build/javascript/webdriver/webdriver'),
	growl = require('growl'),
	config = require('./config');


var driver = new webdriver.Builder()
						.usingServer('http://localhost:4444/wd/hub')
						.withCapabilities(config.driverCapabilities)
						.build();

driver.get(config.baseURL)


var TR = require('../../src/TestRight.js')(driver);
var loginWidget = require('./LoginWidget')(TR);


driver.get(config.baseURL).then(function() {
	loginWidget.open();
	loginWidget.login('toto@toto.com', 'tototo');
	
	driver.getTitle().then(function(title) {
		if (title.contains("Polytech'Move")) {
			console.log(loginWidget.name + ' works');
			growl('Success!');
		} else {
			console.log(loginWidget.name + ' fails');
			growl('Fail!', { priority: 4 });
		}
	});
	
	driver.quit();
});
