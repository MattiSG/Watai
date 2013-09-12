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
	output:	'#output'
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

		checker = new Watai.Widget('Events results widget', checkerElements, my.driver);
	});

	describe('parsing', function() {
		it('should add all elements as properties', function() {
			for (var key in elements)
				if (elements.hasOwnProperty(key)
					&& key != 'missing') {	// Should.js' property checker accesses the property, which would therefore make the missing element throw because it is unreachable
					subject.should.have.property(key);
					should(typeof subject[key] == 'object', 'Key "' + key + '" is not an object');	// prototype of WebDriver internal objects is not augmented
				}
		});

		it('should bind methods properly', function(done) {
			subject.submit('something').then(function() {
				return subject.inputField;
			}).then(function(element) {
				return element.getValue();
			}).then(function(value) {
				value.should.equal('Default');	// because the page has been reloaded
			}).done(done);
		});
	});


	describe('actions', function() {

		describe('magic', function() {

			it('should do some magic on *Link names', function() {
				subject.should.have.property('changeTextareaValueNow');
				subject.changeTextareaValueNow.should.be.a('function');	// on 'link', this should be a shortcut to clicking the element, not a simple access
			});


			Object.each({
				changeTextareaValueNow	: 'changeTextareaValueNowLink',
				press					: 'pressButton',
				toggle					: 'toggleCheckbox',
				select					: 'selectRadio'
			}, function(elementName, action) {
				it('should bind magically created click actions on "' + elementName.replace(action, '') + '"-ending elements', function(done) {
					subject[action]()().then(function() {
						return checker.output;
					}).then(function(checkerOutput) {
						return checkerOutput.text();
					}).then(function(checkerOutputText) {
						checkerOutputText.should.equal(expectedOutputs[elementName]);
					}).done(done, done);
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

				it('should return a promise when calling partial applicator', function(done) {
					var typer = subject.setInputField(EXPECTED);

					typer().done(function() { done() });
				});

				it('should actually send keys when calling partial applicator', function(done) {
					var typer = subject.setInputField(EXPECTED);

					typer().then(function(element) {
						return element.getValue();
					}).then(function(value) {
						value.should.equal(EXPECTED);
					}).done(done);
				});
			});
		});

		describe('`then` property', function() {
			it('should exist', function() {
				subject.toggle().should.have.property('then').with.a('function');
			});

			it('should return a promised execution of the step', function(done) {	// even though it is not an actual promise
				subject.toggle().then(function() {
					return checker.output;
				}).then(function(checkerOutput) {
					return checkerOutput.text();
				}).then(function(checkerOutputText) {
					checkerOutputText.should.equal(expectedOutputs.toggleCheckbox);
				}).done(done, done);
			});
		});
	});


	describe('element access', function() {
		function textShouldBe(elementPromise, expectedText, done) {
			return elementPromise.then(function(element) {
				return element.text();
			}).then(function(text) {
				text.should.equal(expectedText);
			}).done(done);
		}


		it('should map elements to hooks', function(done) {
			textShouldBe(subject.id, expectedContents.id, done);
		});
	});
});
