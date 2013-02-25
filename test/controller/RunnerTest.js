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
			subjectWithFailure = new Watai.Runner(config);

			emitted.start = 0;

			subjectWithFailure.on('start', function() {
				emitted.start++;
			});

			emitted.driverInit = 0;

			subjectWithFailure.on('driverInit', function() {
				emitted.driverInit++;
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
			promises.isPromise(subject.test()).should.be.ok;
			subject.cancel();
		});

		it('should evaluate features once', function(done) {
			this.timeout(config.browserWarmupTime);
			subject.addFeature(feature);

			subject.test().then(function() {
				if (featureEvaluationCount == 1)
					done();
				else	// .should.equal simply does nothing?!
					done(new Error('Feature has been called ' + featureEvaluationCount + ' times instead of 1'));
			}, done);
		});

		it('should evaluate features once again if called again', function(done) {
			this.timeout(config.browserWarmupTime);
			subject.test().then(function() {
				if (featureEvaluationCount == 2)
					done();
				else	// .should.equal simply does nothing?!
					done(new Error('Feature has been called ' + featureEvaluationCount + ' times instead of 2'));
			}, done).end();
		});

		it('should run even if called immediately after init', function(done) {
			this.timeout(config.browserWarmupTime);

			subjectWithFailure.addFeature(feature).test().then(function() {
				if (featureEvaluationCount == 3)
					done();
				else	// .should.equal simply does nothing?!
					done(new Error('Feature has been called ' + featureEvaluationCount + ' times instead of 3'));
			}, done).end();
		});

		it('with failing features should be rejected', function(done) {
			subjectWithFailure.addFeature(failingFeature).test().then(function() {
				done(new Error('Resolved instead of rejected.'))
			}, function(report) {
				should.equal(typeof report, 'object');
				if (! report[failingFeature])
					return done(new Error('Missing feature.'));
				if (! report[failingFeature].length)
					return done(new Error('Missing feature failures details.'));
				passed.failures = report;
				done();
			}).end();
		});
	});

	describe('events', function() {
		it('should have emitted the correct count of "feature" events', function() {
			should.strictEqual(emitted.feature, 3);
		});

		it('should have emitted the correct count of "start" events', function() {
			should.strictEqual(emitted.start, 2);
		});

		it('should have the same count of "start" and "driverInit" events', function() {
			should.strictEqual(emitted.driverInit, emitted.start);
		});

		it('should have emitted the correct count of "restart" events', function() {
			should.strictEqual(emitted.restart, 0);
		});
	});

	describe('cancellation', function() {
		xit('should reject the evaluation with an error', function(done) {
			this.timeout(config.browserWarmupTime);

			subject.test().then(function() { done(new Error('Resolved instead of rejected!')) },
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

			subject.test().then(function() { done() }, done);
		});
	});

	describe('automatic quitting', function() {
		it('should not quit if set to "never"', function(done) {
			this.timeout(config.browserWarmupTime);

			subject.config.quit = 'never';
			subject.test().then(function() {
				should.exist(subject.driver);
				done();
			}, done).end();
		});

		it('should quit on success if set to "on success"', function(done) {
			this.timeout(config.browserWarmupTime);

			subject.config.quit = 'on success';
			subject.test().then(function() {
				should.not.exist(subject.driver);
				done();
			}, done).end();
		});

		it('should quit if set to "always"', function(done) {
			this.timeout(config.browserWarmupTime);

			subject.config.quit = 'always';
			subject.test().then(function() {
				should.not.exist(subject.driver);
				done();
			}, done).end();
		});
	});
});
