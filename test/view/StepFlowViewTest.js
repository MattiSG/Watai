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
		function testShouldContain(term, done) {
			subject = new StepFlowView(step);

			var tester = function() {
				stdoutSpy.unmute();
				stdoutSpy.printed().should.include(term);
			}

			stdoutSpy.mute();
			step.test().then(tester, tester).finally(done);
		}

		describe('arbitrary action report', function() {
			var ACTION = 'testAction';

			describe('successful action', function() {
				before(function() {
					step = new Watai.steps.FunctionalStep(function testAction() {
						/* do nothing */
					});
				});

				it('should mention name of a successful action', function(done) {
					testShouldContain(ACTION, done);
				});
			});

			describe('failing action', function() {
				var REASON = 'Boom!';

				before(function() {
					step = new Watai.steps.FunctionalStep(function testAction() {
						throw REASON;
					});
				});

				it('should mention action name', function(done) {
					testShouldContain(ACTION, done);
				});

				it('should mention thrown value', function(done) {
					testShouldContain(REASON, done);
				});
			});
		});

		describe('widget action report', function() {
			var ACTION,
				PARAM;

			beforeEach(function() {
				step = new Watai.steps.FunctionalStep(testWidget[ACTION](PARAM));
				subject = new StepFlowView(step);
			});

			describe('with a simple action name', function() {
				before(function() {
					ACTION = 'submit';
					PARAM = 'test';
				});

				it('should mention the name of the action', function(done) {
					stdoutSpy.mute();
					step.test().then(function() {
						stdoutSpy.unmute();
						stdoutSpy.printed().should.include(ACTION);
					}).done(done, done);
				});

				it('should mention the params of the action', function(done) {
					stdoutSpy.mute();
					step.test().then(function() {
						stdoutSpy.unmute();
						stdoutSpy.printed().should.include(PARAM);
					}).done(done, done);
				});
			});

			describe('with a multi-word action name', function() {
				before(function() {
					ACTION = 'beClever';
				});

				var DESCRIPTION = 'do something very clever';	// this is the function name, humanized

				it('should mention the user-provided action name', function(done) {
					stdoutSpy.mute();
					step.test().then(function() {
						stdoutSpy.unmute();
						stdoutSpy.printed().should.include(DESCRIPTION);
					}).done(done, done);
				});

				it('should mention the key at which the action is available', function(done) {
					stdoutSpy.mute();
					step.test().then(function() {
						stdoutSpy.unmute();
						stdoutSpy.printed().should.include(ACTION);
					}).done(done, done);
				});
			});
		});
	});
});
