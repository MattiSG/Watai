describe('setup', function() {
	it('should define the "driver" global', function() {
		require('should').exist(driver);
	});
	
	it('should point the webdriver to the support page', function(done) {
		this.timeout(config.browserWarmupTimeout);
		
		driver.get(config.baseURL).then(function() {
			done();
		}, function() {
			console.error('');
			console.error('**The Selenium server could not be reached!**');
			console.error('> Did you start it up?');
			console.error('  See the troubleshooting guide if you need help  ;)');
			process.exit(1);
		});
	});
});
