var should = require('should'),
	promises = require('q'),
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

		it ('should not throw when constructing with proper config', function() {
			(function() {
				subject = new TestRight.Runner(config);
			}).should.not.throw();
		});

		it('should emit "ready" when ready', function(done) {
			this.timeout(config.browserWarmupTime);

			subject.isReady().should.not.be.ok;
			subject.on('ready', function() {
				subject.isReady().should.be.ok;
				done();
			});
		});
	});

	describe('driver', function() {
		it('should be defined after constructing a Runner', function() {
			should.exist(subject.getDriver());
		});
	});

	describe('run', function() {
		var callCount = 0;

		it('should return a promise', function() {
			promises.isPromise(subject.run()).should.be.ok;
		});

		it('should evaluate features', function(done) {
			subject.addFeature(new TestRight.Feature('RunnerTest feature', [
				function() { callCount++ }
			], {}));

			subject.run().then(function() {
				callCount.should.equal(1);
				done();
			}, done);
		});

		it('should evaluate features once again if called again', function(done) {
			subject.run().then(function() {
				callCount.should.equal(2);
				done();
			}, done);
		});
	});

	after(function(done) {
		subject.getDriver().quit().then(done, done);
	});
});
