var StateStep = require('../../../src/model/scenario/StateStep');	// TODO: add this to coverage


describe('StateStep', function() {
	var expectedContents = {},
		wrongTexts = {},
		firstKey;	// the first key of expected texts. Yes, it is used in a test.

	before(function() {
		Object.each(require('../../helpers/testWidget').expectedContents, function(text, key) {	// we need to namespace all attributes to TestWidget
			expectedContents['TestWidget.' + key] = text;
			wrongTexts['TestWidget.' + key] = text + ' **modified**';

			if (! firstKey)
				firstKey = 'TestWidget.' + key;
		});
	});


	it('should be made into promises', function() {
		var result = new StateStep(expectedContents);	// weird construct, but that's just whitebox testing, necessarily made on an instance
		result.should.be.a('function');
		promises.isPromise(result()).should.be.ok;
	});

	it('should be parsed within a scenario', function() {
		var directCall = new StateStep(expectedContents);	// weird construct, but that's just whitebox testing, necessarily made on an instance
		var featureFromScenario = featureWithScenario([ expectedContents ]);

		featureFromScenario.should.have.property('steps').with.lengthOf(1);
		String(featureFromScenario.steps[0]).should.equal(String(directCall));
	});

	it('that are empty should pass', function(done) {
		new StateStep({}).test().then(done, function(err) {
			done(new Error('Should have passed (reason: "' + err + ')'));
		})
	});

	it('that fail should be rejected and reasons passed', function(done) {
		featureWithScenario([
			wrongTexts
		]).test().then(function() {
			done(new Error('Unmatched widget state description should not be resolved.'));
		}, function(reasons) {
			var firstReason = reasons.failures[0];
			if (firstReason
				&& firstReason.contains(firstKey)
				&& firstReason.contains(wrongTexts[firstKey])
				&& firstReason.contains(expectedContents[firstKey])) {
				done();
			} else {
				done(new Error('Unmatched widget state description was properly rejected, but the reason for rejection was not clear enough (got "' + firstReason + '").'));
			}
		}).end();
	});

	describe('syntax checks', function() {
		it('with a non-existing property path should throw', function() {
			(function() {
				featureWithScenario([
					{ toto: 'toto'}	// no widget matches this property path. We have to protect users against misspelled paths.
				]);
			}).should.throw(/Could not find/);
		});

		it('with a magically-added property path should throw', function() {
			(function() {
				featureWithScenario([
					{ 'TestWidget.delayedAction': 'toto'}	// The actual element is `delayedActionLink`. `delayedAction` is an action shortcut, but may not be used as a property.
				]);
			}).should.throw(/not an element/);
		});

		/* We cannot decide in advance whether a given identifier will match in another page or not. The only thing we can check is whether we're trying to describe an unknown widget property.
		*/
		it('that are not accessible on the current page but properly written should not throw an error', function() {
			(function() {
				featureWithScenario([
					{ 'TestWidget.missing': 'missing'}
				]);
			}).should.not.throw();
		});
	});

	describe('should be rejected on', function() {
		it('missing elements', function(done) {
			featureWithScenario([
				{ 'TestWidget.missing': 'toto' }
			]).test().then(function() {
				done(new Error('Resolved instead of rejected!'));
			}, function() {
				done();
			}).end();
		});
	});

	describe('options', function() {
		describe('timeout', function() {
			it('should be allowed without any harm', function(done) {
				featureWithScenario([
					WidgetTest.immediateAction(),
					{ timeout: 0 }
				]).test().then(done, done);
			});

			it('should do immediate evaluation if set to 0', function(done) {
				featureWithScenario([
					WidgetTest.immediateAction(),	// make sure the content of the output is reset
					WidgetTest.delayedAction(),
					{
						timeout: 0,
						'TestWidget.output': expectedOutputs.immediateAction
					}
				]).test().then(function() {
					done(new Error('Matched while the expected result should have been set later than evaluation.'))
				}, function() {
					done();
				});
			});

			it('should do delayed evaluation if set to a proper positive value', function(done) {
				featureWithScenario([
					WidgetTest.immediateAction(),	// make sure the content of the output is reset
					WidgetTest.delayedAction(),
					{
						timeout: DELAYED_ACTIONS_DELAY * 2,
						'TestWidget.output': expectedOutputs.delayedActionLink
					}
				]).test().then(done, function(report) {
					var message = "No failure report. See code";

					if (report && report.failures && report.failures[0])
						message = report.failures[0];

					done(new Error(message));
				});
			});

			it('should not be longer than needed if set to a positive value', function(done) {
				this.timeout(DELAYED_ACTIONS_DELAY * 3);

				featureWithScenario([
					WidgetTest.immediateAction(),	// make sure the content of the output is reset
					WidgetTest.otherDelayedAction(),
					{
						timeout: DELAYED_ACTIONS_DELAY * 2,
						'TestWidget.output': expectedOutputs.otherDelayedActionLink
					}
				]).test().then(done, function(report) {
					var message = "No failure report. See code";

					if (report && report.failures && report.failures[0])
						message = report.failures[0];

					done(new Error(message));
				});
			});

			it('should detect changes and fail earlier than maximum if there was a change', function(done) {
				this.timeout(DELAYED_ACTIONS_DELAY * 3);

				featureWithScenario([
					WidgetTest.immediateAction(),	// make sure the content of the output is reset
					WidgetTest.delayedAction(),
					{
						timeout: DELAYED_ACTIONS_DELAY * 2,
						'TestWidget.output': expectedOutputs.otherDelayedActionLink
					}
				]).test().then(function() {
					done(new Error('Matched while the expected result should have been set later than evaluation.'))
				}, function() {
					done();
				});
			});

			it('should fail if expected state comes later than timeout', function(done) {
				this.timeout(DELAYED_ACTIONS_DELAY * 2);

				featureWithScenario([
					WidgetTest.immediateAction(),	// make sure the content of the output is reset
					WidgetTest.otherDelayedAction(),
					{
						timeout: DELAYED_ACTIONS_DELAY / 10,
						'TestWidget.output': expectedOutputs.otherDelayedActionLink
					}
				]).test().then(function() {
					done(new Error('Matched while the expected result should have been set later than evaluation.'))
				}, function(err) {
					done();
				});
			});

			it('should fail if expected state comes later than timeout and timeout is set to 0', function(done) {
				this.timeout(DELAYED_ACTIONS_DELAY * 2);

				featureWithScenario([
					WidgetTest.immediateAction(),	// make sure the content of the output is reset
					WidgetTest.delayedAction(),
					{
						timeout: 0,
						'TestWidget.output': expectedOutputs.delayedActionLink
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
