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
	});

	describe('run', function() {
		var callCount = 0;

		var feature = new TestRight.Feature('RunnerTest feature', [
			function() { callCount++ }
		], {});

		it('should return a promise', function() {
			promises.isPromise(subject.run()).should.be.ok;
			subject.cancel();
		});

		it('should evaluate features once', function(done) {
			this.timeout(config.browserWarmupTime);
			subject.addFeature(feature);

			subject.run().then(function() {
				if (callCount == 1)
					done();
				else	// .should.equal simply does nothing?!
					done(new Error('Feature has been called ' + callCount + ' times instead of 1'));
			}, done);
		});

		it('should evaluate features once again if called again', function(done) {
			this.timeout(config.browserWarmupTime);
			subject.run().then(function() {
				if (callCount == 2)
					done();
				else	// .should.equal simply does nothing?!
					done(new Error('Feature has been called ' + callCount + ' times instead of 2'));
			}, done);
		});

		it('should run even if called immediately after init', function(done) {
			this.timeout(config.browserWarmupTime);

			var runner = new TestRight.Runner(config);
			runner.addFeature(feature).run().then(function() {
				if (callCount == 3)
					done();
				else	// .should.equal simply does nothing?!
					done(new Error('Feature has been called ' + callCount + ' times instead of 3'));

				runner.killDriver();
			}, done);
		});
	});

	describe('cancellation', function() {
		it('should reject the evaluation with an error', function(done) {
			this.timeout(config.browserWarmupTime);

			var rejected = false;
			subject.run().then(function() { done(new Error('Resolved instead of rejected!')) },
							   function() { done() });
			subject.cancel();
		})
	});

	describe('driver kill', function() {
		it('should be idempotent when repeated', function(done) {
			subject.killDriver().then(function() {
				var result = subject.killDriver();
				result.then(done, done);
			}, done);
		})
	});
});
