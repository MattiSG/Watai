var promises = require('q');


var Watai = require('../../helpers/subject'),
	my = require('../../helpers/driver').getDriverHolder(),
	FunctionalStep = Watai.steps.FunctionalStep;


describe('FunctionalStep', function() {
	var TestComponent,
		subject;

	before(function() {
		TestComponent = require('../../helpers/testComponent').getComponent(my.driver);
		subject = new FunctionalStep(function() { /* do nothing */ });
	});

	describe('AstractStepTest (through FunctionalStep)', function() {
		it('should offer a `test` method', function(done) {
			subject.test.should.be.a.Function();
			subject.test().done(function() { done(); });
		});

		it('should have a `startTime` date attribute', function() {
			subject.startTime.should.be.an.instanceof(Date);
		});

		it('should have a `stopTime` date attribute', function() {
			subject.stopTime.should.be.an.instanceof(Date);
		});

		it('should have a stopTime bigger than its startTime', function() {
			subject.stopTime.getTime().should.not.be.below(subject.startTime.getTime());
		});
	});

	describe('user-visible errors', function() {
		function expectMessage(elementName, message, done) {
			new FunctionalStep(function() {
				return TestComponent[elementName].then(function(elm) {
					return elm.click();
				});
			}).test().then(function() {
				throw new Error('Accessing an element with an error did not trigger a failure.');
			}, function(reason) {
				if (! reason.match(message))
					throw new Error('"' + reason + '" is not clear enough.');
			}).done(done);
		}

		it('should be clear for missing elements (code 7)', function(done) {
			expectMessage('missing', /could not be located/, done);
		});

		it('should be clear for unclickable elements (code 13)', function(done) {
			expectMessage('overlayedActionLink', /not clickable/, done);
		});

		it('should be clear for invalid selectors (code 32)', function(done) {
			expectMessage('badSelector', /locator/, done);
		});
	});
});

