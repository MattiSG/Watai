var Watai = require('../helpers/subject'),
	my = require('../helpers/driver').getDriverHolder(),
	should = require('should'),
	subject,
	elements,
	expectedContents,
	expectedOutputs;


/** Component description of elements existing in the “checking” part of the test support page resource.
* These elements have their content updated according to actions made on the “main” elements described above.
*@private
*/
var checkerElements = {
	output:	'#output'
}


/** This test suite is written with [Mocha](http://visionmedia.github.com/mocha/) and [Should](https://github.com/visionmedia/should.js).
*/
describe('Component', function() {
	var checker;

	before(function(done) {
		my.driver.refresh(done);
	});

	before(function() {
		var testComponent = require('../helpers/testComponent');
		elements = testComponent.elements;
		expectedContents = testComponent.expectedContents;
		expectedOutputs = testComponent.expectedOutputs;
		subject = testComponent.getComponent(my.driver);

		checker = new Watai.Component('Events results component', checkerElements, my.driver);
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
			subject.submit('something')().then(function() {
				return subject.inputField;
			}).then(function(element) {
				return element.getValue();
			}).then(function(value) {
				value.should.equal('Default');	// because the page has been reloaded
			}).done(done);
		});
	});


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


	describe('element access', function() {
		function textShouldBe(elementPromise, expectedText, done) {
			return elementPromise.then(function(element) {
				return element.text();
			}).then(function(text) {
				text.should.equal(expectedText);
			}).done(done);
		}


		it('should map elements to locators', function(done) {
			textShouldBe(subject.id, expectedContents.id, done);
		});
	});
});
