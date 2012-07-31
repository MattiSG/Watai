var subject;

describe('Runner', function() {
	describe('constructor', function() {
		it('should refuse to construct a runner with no config', function() {
			(function() {
				new TestRight.Runner();
			}).should.throw();
		});

		it('should refuse to construct a runner with no base URL', function() {
			(function() {
				new TestRight.Runner({});
			}).should.throw();
		});
	});

	describe('driver', function() {
		it('should be defined after constructing a Runner', function() {

		});
	});
});
