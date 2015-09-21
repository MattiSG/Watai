var Watai			= require('../helpers/subject'),
	stdoutSpy		= require('../helpers/StdoutSpy'),
	StepVerboseView	= require(Watai.path + '/view/Step/Verbose'),
	TestComponent	= require('../helpers/testComponent'),
	my				= require('../helpers/driver').getDriverHolder();


/** This test suite is written with [Mocha](http://visionmedia.github.com/mocha/) and [Should](https://github.com/visionmedia/should.js).
*/
describe('Step verbose view', function() {
	var step,
		subject,
		testComponent;

	before(function() {
		testComponent = TestComponent.getComponent(my.driver);
	});

	beforeEach(function() {
		stdoutSpy.reset();
	});

	afterEach(function() {
		stdoutSpy.unmute();	// keep it in the `after` handler just in case something goes wrong in the test
	});


	function testShouldContain(term, done) {
		subject = new StepVerboseView(step);

		var tester = function() {
			stdoutSpy.unmute();
			stdoutSpy.printed().should.include(term);
		}

		stdoutSpy.mute();
		step.test().then(tester, tester).done(done, done);
	}

	function testShouldNotMatch(regexp, done) {
		subject = new StepVerboseView(step);

		var tester = function() {
			stdoutSpy.unmute();
			stdoutSpy.printed().should.not.match(regexp);
		}

		stdoutSpy.mute();
		step.test().then(tester, tester).done(done, done);
	}


	describe('functional step', function() {
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

		describe('component action report', function() {
			var ACTION,
				PARAM;

			beforeEach(function() {
				if (typeof PARAM != 'undefined')
					step = new Watai.steps.FunctionalStep(testComponent[ACTION](PARAM));
				else
					step = new Watai.steps.FunctionalStep(testComponent[ACTION]());
			});

			describe('with a simple action name', function() {
				before(function() {
					ACTION = 'submit';
					PARAM = 'test';
				});

				it('should mention the name of the action', function(done) {
					testShouldContain(ACTION, done);
				});
			});

			describe('empty action parameters', function() {
				before(function() {
					ACTION = 'submit';
					PARAM = '';
				});

				it('should be mentioned', function(done) {
					testShouldContain('""', done);
				});
			});

			describe('non-empty action parameters', function() {
				before(function() {
					ACTION = 'submit';
					PARAM = 'test';
				});

				it('should be mentioned', function(done) {
					testShouldContain(PARAM, done);
				});
			});

			describe('with a multi-word action name', function() {
				before(function() {
					ACTION = 'beClever';
					PARAM = undefined;
				});

				var DESCRIPTION = 'do something very clever';	// this is the function name, humanized

				it('should mention the user-provided action name', function(done) {
					testShouldContain(DESCRIPTION, done);
				});

				it('should mention the key at which the action is available', function(done) {
					testShouldContain(ACTION, done);
				});
			});

			describe('with a magic action', function() {
				before(function() {
					ACTION = 'changeTextareaValueNow';
					PARAM = undefined;
				});

				var DESCRIPTION = 'change textarea value now';

				it('should mention the human-readable action', function(done) {
					testShouldContain(DESCRIPTION, done);
				});

				it('should mention the generated action name', function(done) {
					subject = new StepVerboseView(step);

					stdoutSpy.mute();
					step.test().then(function() {
						stdoutSpy.unmute();
						stdoutSpy.printed().should.include(ACTION);
						stdoutSpy.printed().should.not.match(/link/i);	// ensure the action name does not contain the original element name
					}).done(done, done);
				});
			});
		});
	});

	describe('text matching step', function() {
		var VALUE;

		beforeEach(function() {
			step = new Watai.steps.StateStep({
				'TestComponent.id': VALUE
			}, {
				TestComponent: testComponent
			});
		});

		describe('with an empty value', function() {
			before(function() {
				VALUE = '';
			});

			it('should mention the element name', function(done) {
				testShouldContain('id', done);
			});

			it('should mention the expected value', function(done) {
				testShouldContain('empty string', done);
			});
		});

		describe('with a matching value', function() {
			before(function() {
				VALUE = TestComponent.expectedContents.id;
			});

			it('should mention the matched value', function(done) {
				testShouldContain(VALUE, done);
			});

			it('should not mention that the "value" matcher fails', function(done) {
				testShouldNotMatch(/Error|null/, done);
			});
		});

		describe('with a non-matching value', function() {
			before(function() {
				VALUE = 'herpaderp';
			});

			it('should mention the expected value', function(done) {
				testShouldContain(VALUE, done);
			});

			it('should mention the actual value', function(done) {
				testShouldContain(TestComponent.expectedContents.id, done);
			});

			it('should not mention that the "value" matcher fails', function(done) {
				testShouldNotMatch(/Error|null/, done);
			});
		});
	});
});
