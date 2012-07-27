describe('Testing environment teardown', function() {
	it('should kill the driver', function(done) {
		driver.quit().then(done, done);
	});
});
