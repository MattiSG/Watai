var Watai = require('../helpers/subject'),
	my = require('../helpers/driver').getDriverHolder(),
	should = require('should'),
	subject,
	elements,
	expectedContents,
	expectedOutputs;


/** Widget description of elements existing in the “checking” part of the test support page resource.
* These elements have their content updated according to actions made on the “main” elements described above.
*@private
*/
var checkerElements = {
	output:	{ id: 'output' }
}


/** This test suite is written with [Mocha](http://visionmedia.github.com/mocha/) and [Should](https://github.com/visionmedia/should.js).
*/
describe('Widget', function() {
	var checker;

	before(function() {
		var testWidget = require('../helpers/testWidget');
		elements = testWidget.elements;
		expectedContents = testWidget.expectedContents;
		expectedOutputs = testWidget.expectedOutputs;
		subject = testWidget.getWidget(my.driver);

		checker = new Watai.Widget('Events results widget', {
			elements: checkerElements
		}, my.driver);
	});

	describe('parsing', function() {
		it('should add all elements as properties', function() {
			for (var key in elements)
				if (elements.hasOwnProperty(key)
					&& key != 'missing') {	// Should.js' property checker accesses the property, which would therefore make the missing element throw because it is unreachable
					subject.should.have.property(key);
					should(typeof subject[key] == 'object');	// prototype of WebDriver internal objects is not augmented
				}
		});

		it('should bind methods properly', function(done) {
			subject.submit('something')();

			subject.inputField.getAttribute('value').then(function(value) {
				value.should.equal('Default');	// because the page has been reloaded
				done();
			});
		});
	});


	describe('magic', function() {
		it('should do some magic on *Link names', function() {
			subject.should.have.property('immediateAction');
			subject.immediateAction.should.be.a('function');	// on 'link', this should be a shortcut to clicking the element, not a simple access
		});

		it('should bind magically created `link` methods to clicking', function(done) {
			subject.immediateAction()();
			checker.output.getText().then(function(text) {
				text.should.equal(expectedOutputs.immediateActionLink);
				done();
			});
		});

		it('should bind magically created `button` methods to clicking', function(done) {
			subject.press()();
			checker.output.getText().then(function(text) {
				text.should.equal(expectedOutputs.pressButton);
				done();
			});
		});

		it('should bind magically created `checkbox` methods to clicking', function(done) {
			subject.toggle()();
			checker.output.getText().then(function(text) {
				text.should.equal(expectedOutputs.toggleCheckbox);
				done();
			});
		});


		describe('setters', function() {
			var EXPECTED = 'set method test';

			it('should be added for all field-type elements', function() {
				subject.setInputField.should.be.a('function');
			});

			it('should be partial applicators for actually sending keys', function() {
				subject.setInputField(EXPECTED).should.be.a('function');
			});

			it('should return a promise when calling partial applicator', function() {
				var typer = subject.setInputField(EXPECTED);

				typer().then.should.be.a('function');
			});

			it('should actually send keys when calling partial applicator', function(done) {
				var typer = subject.setInputField(EXPECTED);

				typer().then(function() {
					subject.inputField.getAttribute('value').then(function(text) {
						text.should.equal(EXPECTED);
						done();
					});
				});
			});
		});
	});


	describe('element access', function() {
		it('should map elements to hooks', function(done) {
			subject.id.getText().then(function(text) {
				text.should.equal(expectedContents.id);
				done();
			});
		});

		it('should be immediate (as much as local performance allows)', function(done) {
			subject.immediateAction()();
			subject.delayedAction()();
			checker.output.getText().then(function(text) {
				text.should.equal(expectedOutputs.immediateActionLink);
				done();
			});
		});
	});
});
