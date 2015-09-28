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

		it('should not throw when constructing with proper config', function() {
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
				} catch (err) {
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
		scenarioEvaluationCount = 0;

	var scenario = new Watai.Scenario('RunnerTest scenario', [
		function() { scenarioEvaluationCount++ }
	], {}, require('../../config'));

	var failingScenario = new Watai.Scenario('RunnerTest failing scenario', [
		function() {
			var result = promises.defer();
			result.reject('This is reason enough for rejection.');
			return result.promise;
		}
	], {}, require('../../config'));


	describe('test()', function() {
		var subjectWithFailure;	// a second subject that will have a failing scenario added


		before(function() {
			subjectWithFailure = new Watai.Runner(config);

			emitted.start = 0;

			subjectWithFailure.on('start', function() {
				emitted.start++;
			});

			emitted.scenario = 0;

			subjectWithFailure.on('scenario', function() {
				emitted.scenario++;
			});
		});

		after(function(done) {
			subjectWithFailure.quitBrowser().done(done, done);
		});


		it('should return a promise', function(done) {
			this.timeout(config.browserWarmupTime);

			subject.test().done(function() { done() });
		});

		it('should evaluate scenarios once', function(done) {
			this.timeout(config.browserWarmupTime);

			subject.addScenario(scenario);

			subject.test().then(function() {
				scenarioEvaluationCount.should.equal(1);
			}).done(done);
		});

		it('should evaluate scenarios once again if called again', function(done) {
			this.timeout(config.browserWarmupTime);

			subject.test().then(function() {
				scenarioEvaluationCount.should.equal(2);
			}).done(done);
		});

		it('with failing scenarios should be rejected', function(done) {
			this.timeout(config.browserWarmupTime);

			subjectWithFailure.addScenario(failingScenario).test().then(function() {
				throw new Error('Resolved instead of rejected.');
			}, function(report) {
				should.equal(typeof report, 'object');
				if (! report[failingScenario])
					throw new Error('Missing scenario.');
				if (! report[failingScenario].length)
					throw new Error('Missing scenario failures details.');
				passed.failures = report;
			}).done(done);
		});

		describe('with bail option', function() {
			it('should not evaluate a scenario after one has failed', function(done) {
				var calledCount = scenarioEvaluationCount;

				subjectWithFailure.config.bail = true;
				subjectWithFailure.addScenario(scenario).test().then(
					function() {
						throw new Error('Resolved instead of being rejected!');
					},
					function() {
						if (scenarioEvaluationCount > calledCount)
							throw new Error('Bail option does not stop evaluation');
					}
				).done(done, done);
			});
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
		it('should have emitted as many "scenario" events as loaded scenarios', function() {
			should.strictEqual(emitted.scenario, 2);
		});

		it('should have emitted as many "start" events as was started', function() {
			should.strictEqual(emitted.start, 2);
		});
	});

	describe('quitting browser', function() {
		it('should be idempotent through repetition', function(done) {
			this.timeout(config.browserWarmupTime / 2);	// this should be faster than warmup, but can still be longer than the default timeout

			subject.quitBrowser().then(function() {
				return subject.quitBrowser();
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
				should.exist(subject.initialized);
				done();
			});
		});

		it('should quit on success if set to "on success"', function(done) {
			this.timeout(config.browserWarmupTime);

			subject.config.quit = 'on success';
			subject.test().done(function() {
				should.not.exist(subject.initialized);
				done();
			});
		});

		it('should quit if set to "always"', function(done) {
			this.timeout(config.browserWarmupTime);

			subject.config.quit = 'always';
			subject.test().done(function() {
				should.not.exist(subject.initialized);
				done();
			});
		});
	});
});
