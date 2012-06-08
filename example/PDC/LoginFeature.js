module.exports = function(TR, driver) {
	var loginWidget = require('./LoginWidget')(TR, driver);
	
	return new TR.Feature("A user should be able to log in", function(assert) {
		loginWidget.open();
		loginWidget.login('toto@toto.com', 'tototo');
		
		driver.getTitle().then(function(title) {
			assert(title.contains('Polytech\'Move'));
		});
	});
}
