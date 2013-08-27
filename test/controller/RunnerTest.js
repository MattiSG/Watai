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

			subject.isReady().should.be.false;

			subject.test();
			subject.once('ready', function() {
				try {
					subject.isReady().should.be.true;
					done();
				} catch(err) {
					done(err);
				}
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
	], {}, require('../config'));

	var failingFeature = new Watai.Feature('RunnerTest failing feature', [
		function() {
			var result = promises.defer();
			result.reject('This is reason enough for rejection.');
			return result.promise;
		}
	], {}, require('../config'));


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

			emitted.feature = 0;

			subjectWithFailure.on('feature', function() {
				emitted.feature++;
			});
		});

		after(function() {
			subjectWithFailure.killDriver();
		});


		it('should return a promise', function(done) {
			this.timeout(config.browserWarmupTime);

			subject.test().done(function() { done() });
		});

		it('should evaluate features once', function(done) {
			this.timeout(config.browserWarmupTime);

			subject.addFeature(feature);

			subject.test().then(function() {
				featureEvaluationCount.should.equal(1);
			}).done(done);
		});

		it('should evaluate features once again if called again', function(done) {
			this.timeout(config.browserWarmupTime);

			subject.test().then(function() {
				featureEvaluationCount.should.equal(2);
			}).done(done);
		});

		it('should run even if called immediately after init', function(done) {
			this.timeout(config.browserWarmupTime);

			subjectWithFailure.addFeature(feature).test().then(function() {
				featureEvaluationCount.should.equal(3);
			}).done(done);
		});

		it('with failing features should be rejected', function(done) {
			this.timeout(config.browserWarmupTime);

			subjectWithFailure.addFeature(failingFeature).test().then(function() {
				done(new Error('Resolved instead of rejected.'));
			}, function(report) {
				should.equal(typeof report, 'object');
				if (! report[failingFeature])
					return done(new Error('Missing feature.'));
				if (! report[failingFeature].length)
					return done(new Error('Missing feature failures details.'));
				passed.failures = report;
				done();
			}).done();
		});

		describe('with an unreachable Selenium server', function() {
			var subject;

			before(function() {
				var unreachableConfig = Object.clone(config);

				unreachableConfig.seleniumServerURL = 'http://0.0.0.0:3333';

				subject = new Watai.Runner(unreachableConfig);
			});

			it('should be rejected', function(done) {
				subject.test().done(function() {
					done(new Error('Resolved instead of being rejected!'));
				}, function(err) {
					done();
				});
			});
		});
	});

	describe('events', function() {
		it('should have emitted as many "feature" events as loaded features', function() {
			should.strictEqual(emitted.feature, 3);
		});

		it('should have emitted as many "start" events as was started', function() {
			should.strictEqual(emitted.start, 2);
		});

		it('should have emitted only one "driverInit" event, on init', function() {
			should.strictEqual(emitted.driverInit, 0);	// on init => before we could listen to it, so there are 0 caught events
		});
	});

	describe('driver kill', function() {
		it('should be idempotent through repetition', function(done) {
			this.timeout(config.browserWarmupTime / 2);	// this should be faster than warmup, but can still be longer than the default timeout

			subject.killDriver().then(function() {
				return subject.killDriver();
			}).done(done);
		});

		it('should not forbid a proper second run', function(done) {
			this.timeout(config.browserWarmupTime);

			subject.test().done(function() { done() }, done);
		});
	});

	describe('automatic quitting', function() {
		it('should not quit if set to "never"', function(done) {
			this.timeout(config.browserWarmupTime);

			subject.config.quit = 'never';
			subject.test().done(function() {
				should.exist(subject.driver);
				done();
			});
		});

		it('should quit on success if set to "on success"', function(done) {
			this.timeout(config.browserWarmupTime);

			subject.config.quit = 'on success';
			subject.test().done(function() {
				should.not.exist(subject.driver);
				done();
			});
		});

		it('should quit if set to "always"', function(done) {
			this.timeout(config.browserWarmupTime);

			subject.config.quit = 'always';
			subject.test().done(function() {
				should.not.exist(subject.driver);
				done();
			});
		});
	});
});
