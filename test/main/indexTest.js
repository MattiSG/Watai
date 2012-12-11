var spawn = require('child_process').spawn;

describe('Error code', function() {
	it('should be 0 on a successful test', function(done) {
		this.timeout(30 * 1000);

		var subject = spawn('./go', [ 'example/DuckDuckGo - advanced matchers' ]);

		subject.on('exit', function(code) {
			code.should.equal(0);
			done();
		});
	});

	it('should be 1 on a failed test', function(done) {
		this.timeout(30 * 1000);

		var subject = spawn('./go', [ 'test/resources/FailingSuite' ]);

		subject.on('exit', function(code) {
			code.should.equal(1);
			done();
		});
	});
})