var should = require('should'),
	promises = require('q'),
	Watai = require('../helpers/subject'),
	config = require('../helpers/driver').config;


var subject;

describe('Runner', function() {
	describe('constructor', function() {
		it('should refuse to construct a runner with no config', function() {
			(function() {
				new Watai.Runner();
			}).should.throw();
		});

		it('should refuse to construct a runner with no base URL', function() {
			(function() {
				new Watai.Runner({
					seleniumServerURL: 'http://example.com'
				});
			}).should.throw();
		});

		it('should refuse to construct a runner with no Selenium Server URL', function() {
			(function() {
				new Watai.Runner({
					baseURL: 'http://example.com'
				});
			}).should.throw();
		});

		it ('should not throw when constructing with proper config', function() {
			(function() {
				subject = new Watai.Runner(config);
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


	var emitted = {},	// observer storage for event-emitted data
		passed = {},	// observer storage for data passed through promises, to compare with events
		featureEvaluationCount = 0;

	var feature = new Watai.Feature('RunnerTest feature', [
		function() { featureEvaluationCount++ }
	], {});

	var failingFeature = new Watai.Feature('RunnerTest failing feature', [
		function() {
			var result = promises.defer();
			result.reject('This is reason enough for rejection.');
			return result.promise;
		}
	], {});


	describe('run', function() {
		var subjectWithFailure;	// a second subject that will have a failing feature added


		before(function() {
			subject.once('success', function() {
				emitted.success = true;
			});

			subjectWithFailure = new Watai.Runner(config);
			subjectWithFailure.once('failure', function(failures) {
				emitted.failures = failures;
			});

			emitted.run = 0;

			subjectWithFailure.on('run', function() {
				emitted.run++;
			});

			emitted.beforeRun = 0;

			subjectWithFailure.on('beforeRun', function() {
				emitted.beforeRun++;
			});

			emitted.restart = 0;

			subjectWithFailure.on('restart', function() {
				emitted.restart++;
			});

			emitted.feature = 0;

			subjectWithFailure.on('feature', function() {
				emitted.feature++;
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
				if (featureEvaluationCount == 1)
					done();
				else	// .should.equal simply does nothing?!
					done(new Error('Feature has been called ' + featureEvaluationCount + ' times instead of 1'));
			}, done);
		});

		it('should evaluate features once again if called again', function(done) {
			this.timeout(config.browserWarmupTime);
			subject.run().then(function() {
				if (featureEvaluationCount == 2)
					done();
				else	// .should.equal simply does nothing?!
					done(new Error('Feature has been called ' + featureEvaluationCount + ' times instead of 2'));
			}, done).end();
		});

		it('should run even if called immediately after init', function(done) {
			this.timeout(config.browserWarmupTime);

			subjectWithFailure.addFeature(feature).run().then(function() {
				if (featureEvaluationCount == 3)
					done();
				else	// .should.equal simply does nothing?!
					done(new Error('Feature has been called ' + featureEvaluationCount + ' times instead of 3'));
			}, done).end();
		});

		xit('with failing features should be rejected', function(done) {
			subjectWithFailure.addFeature(failingFeature).run().then(function() {
				done(new Error('Resolved instead of rejected.'))
			}, function(report) {
				should.equal(typeof report, 'object');
				if (! report[failingFeature])
					done(new Error('Missing feature.'));
				if (! report[failingFeature].failures)
					done(new Error('Missing feature failures details.'));
				passed.failures = report;
				done();
			}).end();
		});
	});

	describe('events', function() {
		it('should have emitted a "success" event', function() {
			should.strictEqual(emitted.success, true);
		});

		it('should have emitted a "failure" event with the same failures as passed on failure', function() {
			should.equal(emitted.failures, passed.failures);
		});

		it('should have emitted the correct count of "feature" events', function() {
			should.strictEqual(emitted.feature, 3);
		});

		it('should have emitted the correct count of "run" events', function() {
			should.strictEqual(emitted.run, 2);
		});

		it('should have the same count of "run" and "beforeRun" events', function() {
			should.strictEqual(emitted.beforeRun, emitted.run);
		});

		it('should have emitted the correct count of "restart" events', function() {
			should.strictEqual(emitted.restart, 0);
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
	});
});
