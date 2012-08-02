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
			
			var handler = function() {
				subject.isReady().should.be.ok;
				done();
				subject.removeListener('ready', handler);
			}

			subject.on('ready', handler);
		});
	});

	describe('driver', function() {
		it('should be defined after constructing a Runner', function() {
			should.exist(subject.getDriver());
		});

		it('should be idempotent to kill an already killed Runner', function(done) {
			subject.killDriver().then(function() {
				var result = subject.killDriver();
				promises.isPromise(result).should.be.ok;
				result.then(done, done);
			}, done);
		})
	});

	describe('run', function() {
		var callCount = 0;

		var feature = new TestRight.Feature('RunnerTest feature', [
			function() { callCount++ }
		], {});

		it('should return a promise', function() {
			promises.isPromise(subject.run()).should.be.ok;
		});

		it('should evaluate features', function(done) {
			subject.addFeature(feature);

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

		xit('should run even if called immediately after init', function(done) {
			this.timeout(config.browserWarmupTime);

			(new TestRight.Runner(config)).addFeature(feature)
										  .run()
										  .then(function() {
				callCount.should.equal(3);
				done();
			}, done);
		});
	});

	after(function(done) {
		subject.killDriver().then(done, done);
	});
});
