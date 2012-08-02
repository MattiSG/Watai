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

			subject.once('ready', function() {
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
		var callCount = 0,
			successEmitted = false,
			featureSuccessSource,
			subjectWithFailure,
			passedFailures,
			emittedFailures,
			emittedFeatureFailure,
			passedErrors,
			emittedFeatureError;

		var feature = new TestRight.Feature('RunnerTest feature', [
			function() { callCount++ }
		], {}),
			failingFeature = new TestRight.Feature('RunnerTest failing feature', [
			function() {
				var result = promises.defer();
				result.reject('This is reason enough for rejection.');
				return result.promise;
			}
		], {}),
			errorFeature = new TestRight.Feature('RunnerTest failing feature', [
			function() { throw "It's a trap!" }
		], {});

		before(function() {
			subject.on('success', function() {
				successEmitted = true;
			});

			subject.on('featureSuccess', function(feature) {
				featureSuccessSource = feature;
			});

			subjectWithFailure = new TestRight.Runner(config);
			subjectWithFailure.once('failure', function(failures) {
				emittedFailures = failures;
			});
			subjectWithFailure.once('featureFailure', function(feature, failures) {
				emittedFeatureFailure = failures;
			});
			subjectWithFailure.once('featureError', function(feature, errors) {
				emittedFeatureError = errors;
			});
		});

		after(function() {
			subjectWithFailure.killDriver();
		});


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
			}, done).end();
		});

		it('should run even if called immediately after init', function(done) {
			this.timeout(config.browserWarmupTime);

			subjectWithFailure.addFeature(feature).run().then(function() {
				if (callCount == 3)
					done();
				else	// .should.equal simply does nothing?!
					done(new Error('Feature has been called ' + callCount + ' times instead of 3'));
			}, done).end();
		});

		it('with failing features should be rejected', function(done) {
			subjectWithFailure.addFeature(failingFeature).run().then(function() {
				done(new Error('Resolved instead of rejected.'))
			}, function(report) {
				should.equal(typeof report, 'object');
				if (! report[failingFeature])
					done(new Error('Missing feature.'));
				if (! report[failingFeature].failures)
					done(new Error('Missing feature failures details.'));
				passedFailures = report;
				done();
			}).end();
		});

		it('with error-prone features should be rejected', function(done) {
			subjectWithFailure.addFeature(errorFeature).run().then(function() {
				done(new Error('Resolved instead of rejected.'))
			}, function(report) {
				should.equal(typeof report, 'object');
				if (! report[errorFeature])
					done(new Error('Missing feature.'));
				if (! report[errorFeature].errors)
					done(new Error('Missing feature errors details.'));
				passedErrors = report;
				done();
			}).end();
		});

		it('should have emitted a "success" event', function() {
			should.strictEqual(successEmitted, true);
		});

		it('should have emitted a "featureSuccess" event, passing the source feature', function() {
			should.strictEqual(featureSuccessSource, feature);
		});

		it('should have emitted a "failure" event with the same failures as passed on failure', function() {
			should.equal(emittedFailures, passedFailures);
		});

		it('should have emitted a "featureFailure" event with the same failure as passed on failure', function() {
			should.equal(emittedFeatureFailure, emittedFailures[failingFeature].failures);
		});

		it('should have emitted a "featureError" event with the same error as passed on error', function() {
			should.equal(emittedFeatureError, passedErrors[errorFeature].errors);
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
		it('should be idempotent through repetition', function(done) {
			this.timeout(config.browserWarmupTime / 2);	// this should be faster than warmup, but can still be longer than the default timeout

			subject.killDriver().then(function() {
				var result = subject.killDriver();
				result.then(done, done).end();
			}, done);
		});

		it('should not forbid a proper second run', function(done) {
			this.timeout(config.browserWarmupTime);

			subject.run().then(function() { done() }, done);
		});
	});

	describe('automatic quitting', function() {
		it('should not quit if set to "never"', function(done) {
			this.timeout(config.browserWarmupTime);

			subject.config.quit = 'never';
			subject.run().then(function() {
				should.exist(subject.driver);
				done();
			}, done).end();
		});

		it('should quit on success if set to "on success"', function(done) {
			this.timeout(config.browserWarmupTime);

			subject.config.quit = 'on success';
			subject.run().then(function() {
				should.not.exist(subject.driver);
				done();
			}, done).end();
		});

		it('should quit if set to "always"', function(done) {
			this.timeout(config.browserWarmupTime);

			subject.config.quit = 'always';
			subject.run().then(function() {
				should.not.exist(subject.driver);
				done();
			}, done).end();
		});
	})
});
