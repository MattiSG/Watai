var promises = require('q');


var Watai = require('../../helpers/subject'),
	my = require('../../helpers/driver').getDriverHolder(),
	FunctionalStep = Watai.steps.FunctionalStep;

/** Milliseconds the actions take to delay changing the output on the test page.
* Set in the test page (`test/resources/page.html`).
*/
var DELAYED_ACTIONS_DELAY = 500;


describe('FunctionalStep', function() {
	var TestWidget;

	before(function() {
		TestWidget = require('../../helpers/testWidget').getWidget(my.driver);
	});


	it('should offer a `test` method', function() {
		var result = new FunctionalStep(function() { /* do nothing */ });
		result.test.should.be.a('function');
		promises.isPromise(result.test()).should.be.ok;
	});

	describe('user-visible errors', function() {

		function expectMessage(elementName, message, done) {
			new FunctionalStep(function() {
					return TestWidget[elementName].then(function(elm) {
						return elm.click();
					});
				})
				.test().then(function() {
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
