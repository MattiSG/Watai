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
		TestWidget,
		firstKey;	// the first key of expected texts. Yes, it is used in a test.

	before(function() {
		Object.each(require('../../helpers/testWidget').expectedContents, function(text, key) {	// we need to namespace all attributes to TestWidget
			expectedContents['TestWidget.' + key] = text;
			wrongTexts['TestWidget.' + key] = text + ' **modified**';

			if (! firstKey)
				firstKey = 'TestWidget.' + key;
		});

		TestWidget = require('../../helpers/testWidget').getWidget(my.driver);
	});


	it('should offer a `test` method', function() {
		var result = new StateStep(expectedContents, { TestWidget: TestWidget });
		result.test.should.be.a('function');
		promises.isPromise(result.test()).should.be.ok;
	});

	it('that are empty should pass', function(done) {
		new StateStep({}, { TestWidget: TestWidget })
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
				new StateStep({ toto: 'toto' }, { TestWidget: TestWidget });	// no widget matches this property path. We have to protect users against misspelled paths.
			}).should.throw(/Could not find/);
		});

		it('with a magically-added property path should throw', function() {
			(function() {
				new StateStep({ 'TestWidget.changeTextareaValueLater': 'toto' }, { TestWidget: TestWidget });	// The actual element is `changeTextareaValueLaterLink`. `changeTextareaValueLater` is an action shortcut, but may not be used as a property.]);
			}).should.throw(/not an element/);
		});

		/* We cannot decide in advance whether a given identifier will match in another page or not. The only thing we can check is whether we're trying to describe an unknown widget property.
		*/
		it('that are not accessible on the current page but properly written should not throw an error', function() {
			(function() {
				new StateStep({ 'TestWidget.missing': 'missing' }, { TestWidget: TestWidget });
			}).should.not.throw();
		});
	});


	describe('should be rejected on', function() {
		it('missing elements', function(done) {
			this.timeout(5000);

			new StateStep({ 'TestWidget.missing': 'toto' }, { TestWidget: TestWidget })
				.test().then(function() {
					done(new Error('Resolved instead of rejected!'));
				}, function() {
					done();
				}
			).done();
		});

		it('non-matching textual content', function(done) {
			new StateStep(wrongTexts, { TestWidget: TestWidget })
				.test().then(function() {
					done(new Error('Unmatched widget state description should not be resolved.'));
				}, function(reason) {
					Object.each(require('../../helpers/testWidget').expectedContents, function(text, key) {
						if (! (reason
							&& reason.contains(key)
							&& reason.contains(wrongTexts['TestWidget.' + key])
							&& reason.contains(expectedContents['TestWidget.' + key]))) {
							done(new Error('Unmatched widget state description was properly rejected, but the reason for rejection was not clear enough (got "' + reason + '", expected values associated with "' + key + '").'));
						}
					});
					done();
				}
			).done();
		});
	});


	describe('options', function() {
		describe('timeout', function() {
			var featureWithScenario,
				expectedOutputs;


			before(function() {
				featureWithScenario = function featureWithScenario(scenario) {
					return new Watai.Feature('Test feature', scenario, { TestWidget: TestWidget }, require('../../../config'));
				}

				expectedOutputs = require('../../helpers/testWidget').expectedOutputs;
			});


			it('should be allowed without any harm', function(done) {
				new StateStep({ timeout: 0 }, { StateStep: StateStep })
					.test().then(function() {
						done()
					}, done);
			});

			it('should do immediate evaluation if set to 0', function(done) {
				featureWithScenario([
					TestWidget.changeTextareaValueNow(),	// make sure the content of the output is reset
					TestWidget.changeTextareaValueLater(),
					{
						timeout: 0,
						'TestWidget.output': expectedOutputs.changeTextareaValueLaterLink
					}
				]).test().then(function() {
					done(new Error('Matched while the expected result should have been set later than evaluation.'))
				}, function() {
					done();
				}).done();
			});

			it('should do delayed evaluation if set to a proper positive value', function(done) {
				featureWithScenario([
					TestWidget.changeTextareaValueNow(),	// make sure the content of the output is reset
					TestWidget.changeTextareaValueLater(),
					{
						timeout: DELAYED_ACTIONS_DELAY * 2,
						'TestWidget.output': expectedOutputs.changeTextareaValueLaterLink
					}
				]).test().then(function() {
					done();
				}, function(reason) {
					done(new Error(reason || 'No failure message passed.'));
				}).done();
			});

			it('should not be longer than needed if set to a positive value', function(done) {
				this.timeout(DELAYED_ACTIONS_DELAY * 3);

				featureWithScenario([
					TestWidget.changeTextareaValueNow(),	// make sure the content of the output is reset
					TestWidget.changeTextareaValueLaterAgain(),
					{
						timeout: DELAYED_ACTIONS_DELAY * 2,
						'TestWidget.output': expectedOutputs.changeTextareaValueLaterAgainLink
					}
				]).test().then(function() {
					done();
				}, function(reason) {
					done(new Error(reason || 'No failure message passed.'));
				}).done();
			});

			it('should fail if expected state comes later than timeout', function(done) {
				this.timeout(DELAYED_ACTIONS_DELAY * 2);

				featureWithScenario([
					TestWidget.changeTextareaValueNow(),	// make sure the content of the output is reset
					TestWidget.changeTextareaValueLaterAgain(),
					{
						timeout: DELAYED_ACTIONS_DELAY / 10,
						'TestWidget.output': expectedOutputs.changeTextareaValueLaterAgainLink
					}
				]).test().then(function() {
					done(new Error('Matched while the expected result should have been set later than evaluation.'))
				}, function(err) {
					done();
				}).done();
			});

			it('should fail if expected state comes later than timeout and timeout is set to 0', function(done) {
				this.timeout(DELAYED_ACTIONS_DELAY * 2);

				featureWithScenario([
					TestWidget.changeTextareaValueNow(),	// make sure the content of the output is reset
					TestWidget.changeTextareaValueLater(),
					{
						timeout: 0,
						'TestWidget.output': expectedOutputs.changeTextareaValueLaterLink
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
