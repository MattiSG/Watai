var promises = require('q');


var Watai = require('../../helpers/subject'),
	my = require('../../helpers/driver').getDriverHolder(),
	StateStep = Watai.steps.StateStep;

/** Milliseconds the actions take to delay changing the output on the test page.
* Set in the test page (`test/resources/page.html`).
*/
var DELAYED_ACTIONS_DELAY = 500;


describe('StateStep', function() {
	var expectedContents = {},
		wrongTexts = {},
		TestComponent,
		firstKey;	// the first key of expected texts. Yes, it is used in a test.

	before(function() {
		Object.each(require('../../helpers/testComponent').expectedContents, function(text, key) {	// we need to namespace all attributes to TestComponent
			expectedContents['TestComponent.' + key] = text;
			wrongTexts['TestComponent.' + key] = text + ' **modified**';

			if (! firstKey)
				firstKey = 'TestComponent.' + key;
		});

		TestComponent = require('../../helpers/testComponent').getComponent(my.driver);
	});


	it('should offer a `test` method', function() {
		var result = new StateStep(expectedContents, { TestComponent: TestComponent });
		result.test.should.be.a('function');
		promises.isPromise(result.test()).should.be.ok;
	});

	it('that are empty should pass', function(done) {
		new StateStep({}, { TestComponent: TestComponent })
			.test().then(function() {
				done()
			}, function(err) {
				done(new Error('Should have passed (reason: "' + err + ')'));
			}
		).done();
	});


	describe('syntax checks', function() {
		it('with a non-existing property path should throw', function() {
			(function() {
				new StateStep({ toto: 'toto' }, { TestComponent: TestComponent });	// no component matches this property path. We have to protect users against misspelled paths.
			}).should.throw(/Could not find/);
		});

		it('with a magically-added property path should throw', function() {
			(function() {
				new StateStep({ 'TestComponent.changeTextareaValueLater': 'toto' }, { TestComponent: TestComponent });	// The actual element is `changeTextareaValueLaterLink`. `changeTextareaValueLater` is an action shortcut, but may not be used as a property.]);
			}).should.throw(/not an element/);
		});

		/* We cannot decide in advance whether a given identifier will match in another page or not. The only thing we can check is whether we're trying to describe an unknown component property.
		*/
		it('that are not accessible on the current page but properly written should not throw an error', function() {
			(function() {
				new StateStep({ 'TestComponent.missing': 'missing' }, { TestComponent: TestComponent });
			}).should.not.throw();
		});
	});


	describe('should be rejected on', function() {
		it('missing elements', function(done) {
			this.timeout(5000);

			new StateStep({ 'TestComponent.missing': 'toto' }, { TestComponent: TestComponent })
				.test().then(function() {
					done(new Error('Resolved instead of rejected!'));
				}, function() {
					done();
				}
			).done();
		});

		it('non-matching textual content', function(done) {
			new StateStep(wrongTexts, { TestComponent: TestComponent })
				.test().then(function() {
					done(new Error('Unmatched component state description should not be resolved.'));
				}, function(reason) {
					Object.each(require('../../helpers/testComponent').expectedContents, function(text, key) {
						if (! (reason
							&& reason.contains(key)
							&& reason.contains(wrongTexts['TestComponent.' + key])
							&& reason.contains(expectedContents['TestComponent.' + key]))) {
							done(new Error('Unmatched component state description was properly rejected, but the reason for rejection was not clear enough (got "' + reason + '", expected values associated with "' + key + '").'));
						}
					});
					done();
				}
			).done();
		});
	});


	describe('options', function() {
		describe('timeout', function() {
			var scenarioWithSteps,
				expectedOutputs;


			before(function() {
				scenarioWithSteps = function scenarioWithSteps(scenario) {
					return new Watai.Scenario('Test scenario', scenario, { TestComponent: TestComponent }, require('../../../config'));
				}

				expectedOutputs = require('../../helpers/testComponent').expectedOutputs;
			});


			it('should be allowed without any harm', function(done) {
				new StateStep({ timeout: 0 }, { StateStep: StateStep })
					.test().then(function() {
						done()
					}, done);
			});

			it('should do immediate evaluation if set to 0', function(done) {
				scenarioWithSteps([
					TestComponent.changeTextareaValueNow(),	// make sure the content of the output is reset
					TestComponent.changeTextareaValueLater(),
					{
						timeout: 0,
						'TestComponent.output': expectedOutputs.changeTextareaValueLaterLink
					}
				]).test().then(function() {
					done(new Error('Matched while the expected result should have been set later than evaluation.'))
				}, function() {
					done();
				}).done();
			});

			it('should do delayed evaluation if set to a proper positive value', function(done) {
				scenarioWithSteps([
					TestComponent.changeTextareaValueNow(),	// make sure the content of the output is reset
					TestComponent.changeTextareaValueLater(),
					{
						timeout: DELAYED_ACTIONS_DELAY * 2,
						'TestComponent.output': expectedOutputs.changeTextareaValueLaterLink
					}
				]).test().then(function() {
					done();
				}, function(reason) {
					done(new Error(reason || 'No failure message passed.'));
				}).done();
			});

			it('should not be longer than needed if set to a positive value', function(done) {
				this.timeout(DELAYED_ACTIONS_DELAY * 3);

				scenarioWithSteps([
					TestComponent.changeTextareaValueNow(),	// make sure the content of the output is reset
					TestComponent.changeTextareaValueLaterAgain(),
					{
						timeout: DELAYED_ACTIONS_DELAY * 2,
						'TestComponent.output': expectedOutputs.changeTextareaValueLaterAgainLink
					}
				]).test().then(function() {
					done();
				}, function(reason) {
					done(new Error(reason || 'No failure message passed.'));
				}).done();
			});

			it('should fail if expected state comes later than timeout', function(done) {
				this.timeout(DELAYED_ACTIONS_DELAY * 2);

				scenarioWithSteps([
					TestComponent.changeTextareaValueNow(),	// make sure the content of the output is reset
					TestComponent.changeTextareaValueLaterAgain(),
					{
						timeout: DELAYED_ACTIONS_DELAY / 10,
						'TestComponent.output': expectedOutputs.changeTextareaValueLaterAgainLink
					}
				]).test().then(function() {
					done(new Error('Matched while the expected result should have been set later than evaluation.'))
				}, function(err) {
					done();
				}).done();
			});

			it('should fail if expected state comes later than timeout and timeout is set to 0', function(done) {
				this.timeout(DELAYED_ACTIONS_DELAY * 2);

				scenarioWithSteps([
					TestComponent.changeTextareaValueNow(),	// make sure the content of the output is reset
					TestComponent.changeTextareaValueLater(),
					{
						timeout: 0,
						'TestComponent.output': expectedOutputs.changeTextareaValueLaterLink
					}
				]).test().then(function() {
					done(new Error('Matched while the expected result should have been set later than evaluation.'))
				}, function() {
					done();
				});
			});
		});
	});
});
