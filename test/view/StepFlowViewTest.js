var Watai			= require('../helpers/subject'),
	stdoutSpy		= require('../helpers/StdoutSpy'),
	StepFlowView	= require(Watai.path + '/view/Step/Flow'),
	my = require('../helpers/driver').getDriverHolder();


/** This test suite is written with [Mocha](http://visionmedia.github.com/mocha/) and [Should](https://github.com/visionmedia/should.js).
*/
describe('Step flow view', function() {
	var step,
		subject,
		testWidget;

	before(function() {
		testWidget = require('../helpers/testWidget').getWidget(my.driver);
	});

	beforeEach(function() {
		stdoutSpy.reset();
	});

	afterEach(function() {
		stdoutSpy.unmute();	// keep it in the `after` handler just in case something goes wrong in the test
	});


	describe('functional step', function() {
		describe('widget action', function() {
			var SUBMITTED_VALUE = 'test';

			before(function() {
				step = new Watai.steps.FunctionalStep(testWidget.submit(SUBMITTED_VALUE));
				subject = new StepFlowView(step);
			});

			xit('should be descriptive', function(done) {
				stdoutSpy.mute();
				step.test().then(function() {
					stdoutSpy.unmute();
					stdoutSpy.printed().should.match(new RegExp(SUBMITTED_VALUE));
				}).done(done, done);
			});
		});
	});
});
