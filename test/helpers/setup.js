describe('setup', function() {
	it('should define the "driver" global', function() {
		require('should').exist(driver);
	});
	
	it('should point the webdriver to the support page', function(done) {
		this.timeout(15000);
		
		driver.get('file:///Users/eurogiciel/Documents/Watai/test/resources/page.html').then(function() {
			done();
		});
	});
});
