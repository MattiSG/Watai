var config = require('./config');

config.driver.get(config.baseURL)

var TR = require('../../src/TestRight.js')(config.driver);

var loginWidget = require('./LoginWidget')(TR);


config.driver.get(config.baseURL).then(function() {
	loginWidget.open();
	loginWidget.login('toto@toto.com', 'tototo');
	
	config.driver.getTitle().then(function(title) {
		console.log(loginWidget.name + ' ' + (title.contains("Polytech'Move") ? 'works' : 'fails'));
	});
	
	config.driver.quit();
});
