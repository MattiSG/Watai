var should = require('should'),
	TestRight = require('../helpers/subject'),
	config = require('../helpers/driver').config;


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
				new TestRight.Runner({
					seleniumServerURL: 'http://example.com'
				});
			}).should.throw();
		});

		it('should refuse to construct a runner with no Selenium Server URL', function() {
			(function() {
				new TestRight.Runner({
					baseURL: 'http://example.com'
				});
			}).should.throw();
		});

		it ('should not throw when constructing with proper config', function(done) {
			this.timeout(config.browserWarmupTime);

			(function() {
				subject = new TestRight.Runner(config);
				subject.getDriver().session_.then(function() {
					done();
				}, done);
			}).should.not.throw();
		})
	});

	describe('driver', function() {
		it('should be defined after constructing a Runner', function() {
			should.exist(subject.getDriver());
		});
	});

	describe('events', function() {
		it('should emit "ready" when ready', function(done) {
			this.timeout(config.browserWarmupTime);

			subject = new TestRight.Runner(config);
			subject.isReady().should.not.be.ok;
			subject.on('ready', function() {
				subject.isReady().should.be.ok;
				done();
			});
		});
	});

	after(function(done) {
		subject.getDriver().quit().then(done, done);
	});
});
