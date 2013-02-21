var promises = require('q');

var Watai = require('../helpers/subject'),
	my = require('../helpers/driver').getDriverHolder(),
	expectedOutputs = require('../helpers/testWidget').expectedOutputs,
	WidgetTest;

/** Timeout value of the test's config.
*/
var GLOBAL_TIMEOUT = 500;	//TODO: get from configManager


/** This test suite is redacted with [Mocha](http://visionmedia.github.com/mocha/) and [Should](https://github.com/visionmedia/should.js).
*/
describe('Feature', function() {
	var featureWithScenario;

	before(function() {
		WidgetTest = require('../helpers/testWidget').getWidget(my.driver);

		featureWithScenario = function featureWithScenario(scenario) {
			return new Watai.Feature('Test feature', scenario, { TestWidget: WidgetTest });
		}
	});


	describe('functional scenarios with', function() {
		var failureReason = 'It’s a trap!';

		var failingFeatureTest = function() {
			return featureWithScenario([
				function() { throw failureReason }
			]).test();
		}

		function makeFailingPromiseWithSuffix(suffix) {
			return function() {
				var deferred = promises.defer();
				deferred.reject(failureReason + suffix);
				return deferred.promise;
			}
		}

		var failingPromise = makeFailingPromiseWithSuffix('');


		it('an empty feature should be accepted', function(done) {
			featureWithScenario([]).test().then(function() {
				done();
			}, function(err) {
				done(new Error(err));
			}).end();
		});

		it('a failing function should be rejected', function(done) {
			failingFeatureTest().then(function() {
				done(new Error('Resolved instead of rejected!'));
			}, function() {
				done();	// can't pass it directly, Mocha complains about param not being an error
			}).end();
		});

		it('a failing promise should be rejected', function(done) {
			featureWithScenario([
				failingPromise
			]).test().then(function() {
				done(new Error('Resolved instead of rejected!'));
			}, function() {
				done();
			}).end();
		});

		it('multiple failing promises should be rejected', function(done) {
			featureWithScenario([
				makeFailingPromiseWithSuffix(0),
				makeFailingPromiseWithSuffix(1),
				makeFailingPromiseWithSuffix(2)
			]).test().then(function() {
				done(new Error('Resolved instead of rejected!'));
			}, function() {
				done();
			}).end();
		});

		it('a function should be called', function(done) {
			var called = false;

			featureWithScenario([ function() {
				called = true;
			} ]).test().then(function() {
				if (called)
					done();
				else
					done(new Error('Promise resolved without actually calling the scenario function'));
			}, function() {
				done(new Error('Feature evaluation failed, with' + (called ? '' : 'out')
								+ ' actually calling the scenario function (but that’s still an error)'));
			}).end();
		});
	});


	describe('badly-formatted scenarios', function() {
		function scenarioShouldThrowWith(responsibleStep) {
			(function() {
				featureWithScenario([
					responsibleStep
				]);
			}).should.throw(/at step 1/);
		}

		it('with null should throw', function() {
			scenarioShouldThrowWith(null);
		});

		it('with explicit undefined should throw', function() {
			scenarioShouldThrowWith(undefined);
		});

		it('with undefined reference should throw', function() {
			var a;
			scenarioShouldThrowWith(a);
		});

		it('with a free string should throw', function() {
			scenarioShouldThrowWith('string');
		});

		it('with a free number should throw', function() {
			scenarioShouldThrowWith(12);
		});

		it('with a free 0 should throw', function() {
			scenarioShouldThrowWith(0);
		});
	});


	describe('unclickable elements', function() {
		it('should respect the global timeout', function(done) {
			var start = new Date();

			featureWithScenario([
				WidgetTest.overlayedAction(),
				{
					'TestWidget.output': expectedOutputs.overlayedActionLink
				}
			]).test().then(function() {
				done(new Error('Passed while the overlayed element should not have been clickable!'))
			}, function() {
				var waitedMs = new Date() - start;
				if (waitedMs >= GLOBAL_TIMEOUT)
					done();
				else
					done(new Error('Waited only ' + waitedMs + ' ms instead of at least ' + GLOBAL_TIMEOUT + ' ms.'))
			}).end();
		});

		it('should be fine if made clickable', function(done) {
			featureWithScenario([
				WidgetTest.hideOverlay(),
				WidgetTest.overlayedAction(),
				{
					'TestWidget.output': expectedOutputs.overlayedActionLink
				}
			]).test().then(function() { done() }, function(report) {
				var message = 'No failure report. See code';

				if (report && report.failures && report.failures[0])
					message = report.failures[0];

				done(new Error(message));
			}).end();
		});
	});


	describe('events', function() {
		var subject;

		function expectFired(eventName, expectedParam) {
			var hasExpectedParam = arguments.length > 1;	// allow for falsy values to be expected params

			return function(done) {
				subject.on(eventName, function(param) {
					if (hasExpectedParam)
						param.should.equal(expectedParam);
					done();
				});

				subject.test();
			}
		}

		function expectNotFired(eventName) {
			return function(done) {
				subject.on(eventName, function() {
					done(new Error('Fired while it should not have'));
				});

				subject.test();

				setTimeout(done, 40);
			}
		}

		describe('of a feature with a failing step', function() {
			beforeEach(function() {
				subject = featureWithScenario([
					function() { throw 'Boom!' }
				]);
			});

			[ 'start', 'step' ].forEach(function(type) {
				it('should fire a "' + type + '" event', expectFired(type));
			});

			// [ 'step:start', 'step:end', 'step:failure' ].forEach(function(type) {
			// 	it('should fire a "' + type + '" event and pass the 0-based step index', expectFired(type, 0));
			// });

			// [ 'match:start', 'match:end', 'match:failure' ].forEach(function(type) {
			// 	it('should NOT fire any "' + type + '" event', expectNotFired(type));
			// });
		});

		describe('of a feature with an empty scenario', function() {
			beforeEach(function() {
				subject = featureWithScenario([ ]);
			});

			it('should fire a "start" event', expectFired('start'));
			it('should NOT fire any "step" event', expectNotFired('step'));
		});
	});
});
