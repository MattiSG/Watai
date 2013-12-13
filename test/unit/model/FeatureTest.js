var promises = require('q');

var Watai = require('../helpers/subject'),
	my = require('../helpers/driver').getDriverHolder(),
	expectedOutputs = require('../helpers/testWidget').expectedOutputs,
	WidgetTest;

/** Timeout value of the test's config.
*/
var GLOBAL_TIMEOUT = 500;


/** This test suite is redacted with [Mocha](http://visionmedia.github.com/mocha/) and [Should](https://github.com/visionmedia/should.js).
*/
describe('Feature', function() {
	var featureWithScenario;

	before(function() {
		WidgetTest = require('../helpers/testWidget').getWidget(my.driver);

		featureWithScenario = function featureWithScenario(scenario) {
			return new Watai.Feature('Test feature', scenario, { TestWidget: WidgetTest }, require('../../config'));
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
			featureWithScenario([]).test().done(function() {
				done();
			}, function(err) {
				done(new Error(err));
			});
		});

		it('a failing function should be rejected', function(done) {
			failingFeatureTest().done(function() {
				done(new Error('Resolved instead of rejected!'));
			}, function() {
				done();	// can't pass it directly, Mocha complains about param not being an error
			});
		});

		it('a failing promise should be rejected', function(done) {
			featureWithScenario([
				failingPromise
			]).test().done(function() {
				done(new Error('Resolved instead of rejected!'));
			}, function() {
				done();
			});
		});

		it('multiple failing promises should be rejected', function(done) {
			featureWithScenario([
				makeFailingPromiseWithSuffix(0),
				makeFailingPromiseWithSuffix(1),
				makeFailingPromiseWithSuffix(2)
			]).test().done(function() {
				done(new Error('Resolved instead of rejected!'));
			}, function() {
				done();
			});
		});

		it('a function should be called', function(done) {
			var called = false;

			featureWithScenario([ function() {
				called = true;
			} ]).test().done(function() {
				if (called)
					done();
				else
					done(new Error('Promise resolved without actually calling the scenario function'));
			}, function() {
				done(new Error('Feature evaluation failed, with' + (called ? '' : 'out')
								+ ' actually calling the scenario function (but that’s still an error)'));
			});
		});

		it('a debugger step should be called', function(done) {
			featureWithScenario([ 'debugger' ]).test().done(function() { done() }, done);
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
			this.timeout(GLOBAL_TIMEOUT * 5);

			var start = new Date();

			featureWithScenario([
				WidgetTest.overlayedAction(),
				{ 'TestWidget.output': expectedOutputs.overlayedActionLink }
			]).test().then(function() {
				throw new Error('Passed while the overlayed element should not have been clickable!');
			}, function() {
				(new Date().getTime()).should.be.above(start.getTime() + GLOBAL_TIMEOUT);
			}).done(done, done);
		});

		it('should give human-readable details', function(done) {
			featureWithScenario([
				WidgetTest.overlayedAction()
			]).test().done(function() {
				done(new Error('Passed while the overlayed element should not have been clickable!'));
			}, function(reasons) {
				var reason = reasons[0];
				if (reason.match(/not clickable/))
					done();
				else
					done(new Error('"' + reason + '" is not a human-readable reason for failure'));
			});
		});

		it('should be fine if made clickable', function(done) {
			featureWithScenario([
				WidgetTest.hideOverlay(),
				WidgetTest.overlayedAction(),
				{
					'TestWidget.output': expectedOutputs.overlayedActionLink
				}
			]).test().done(function() { done() }, function(report) {
				done(new Error(report));
			});
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
