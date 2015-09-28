var Watai = require('../helpers/subject'),
	my = require('../helpers/driver').getDriverHolder(),
	should = require('should');


/* Exported to be also used in ComponentTest.
*/
exports.checkLocator = checkLocator = function checkLocator(subject, locatorName, expectedContent) {
	it('should add a locator to the target object', function() {
		subject.should.have.property(locatorName);
	});

	it('should return an object when accessed', function() {
		should(typeof subject[locatorName] == 'object');	// prototype of WebDriver internal objects is not augmented
	});

	it('should have the correct text in the retrieved element', function(done) {
		subject[locatorName].then(function(element) {
			return element.text();
		}).then(function(content) {
			content.should.equal(expectedContent);
		}).done(done);
	});
}

/** This test suite is redacted with [Mocha](http://visionmedia.github.com/mocha/) and [Should](https://github.com/visionmedia/should.js).
*/
describe('Locator', function() {
	var locatorsTarget = new (require('events').EventEmitter)();

	before(function(done) {
		my.driver.refresh(done);
	});

	describe('selector', function() {
		describe('default to css', function() {
			var locatorName = 'default';

			before(function() {
				Watai.Locator.addLocator(locatorsTarget, locatorName, '#toto', my.driver);
			});

			checkLocator(locatorsTarget, locatorName, 'This paragraph has id toto');
		});

		describe('with ID', function() {
			var locatorName = 'id';

			before(function() {
				Watai.Locator.addLocator(locatorsTarget, locatorName, { id: 'toto' }, my.driver);
			});

			checkLocator(locatorsTarget, locatorName, 'This paragraph has id toto');
		});

		describe('with css alias', function() {
			var locatorName = 'css';

			before(function() {
				Watai.Locator.addLocator(locatorsTarget, locatorName, { css: '.tutu' }, my.driver);
			});

			checkLocator(locatorsTarget, locatorName, 'This paragraph has class tutu');
		});

		describe('with css selector', function() {
			var locatorName = 'css selector';

			before(function() {
				Watai.Locator.addLocator(locatorsTarget, locatorName, { 'css selector': '.tutu' }, my.driver);
			});

			checkLocator(locatorsTarget, locatorName, 'This paragraph has class tutu');
		});

		describe('with Xpath', function() {
			var locatorName = 'xpath';

			before(function() {
				Watai.Locator.addLocator(locatorsTarget, locatorName, { xpath: '//div[@id="selectors"]/p[3]' }, my.driver);
			});

			checkLocator(locatorsTarget, locatorName, 'This paragraph is the third of the selectors div');
		});

		describe('with linkText alias', function() {
			var locatorName = 'linkText';

			before(function() {
				Watai.Locator.addLocator(locatorsTarget, locatorName, { linkText: 'This paragraph is embedded in a link' }, my.driver);
			});

			checkLocator(locatorsTarget, locatorName, 'This paragraph is embedded in a link');
		});

		describe('with link text', function() {
			var locatorName = 'link text';

			before(function() {
				Watai.Locator.addLocator(locatorsTarget, locatorName, { 'link text': 'This paragraph is embedded in a link' }, my.driver);
			});

			checkLocator(locatorsTarget, locatorName, 'This paragraph is embedded in a link');
		});

		it('should work on a field too', function(done) {
			var target = 'fieldGetter';

			Watai.Locator.addLocator(locatorsTarget, target, { css: 'input[name="field"]' }, my.driver);

			locatorsTarget[target].then(function(element) {
				element.getAttribute('value').then(function(content) {
					content.should.equal('Default');
				}).done(done);
			});
		});
	});

	describe('setter', function() {
		it('should set the value upon attribution', function(done) {
			var target = 'fieldSetter',
				newContent = 'new content';

			Watai.Locator.addLocator(locatorsTarget, target, { css: 'input[name="field"]' }, my.driver);

			locatorsTarget[target] = newContent;

			setTimeout(function() {	// TODO: this has to be delayed because the setter above triggers a series of async actions, and we need the evaluation to be done *after* these actions. This should be modified along with a rethink of the way the setter works.
				locatorsTarget[target].then(function(element) {
					return element.getAttribute('value');
				}).then(function(content) {
					content.should.equal(newContent);
				}).done(done);
			}, 200);
		});

		it('should throw an exception if the setter already exists', function() {
			var target = 'fieldSetter',
				newContent = 'new content';

			(function() {
				Watai.Locator.addLocator(locatorsTarget, target, { css: 'input[name="field"]' }, my.driver);
			}).should.throw(new RegExp('Cannot redefine.*' + target));
		});

		describe('metadata', function() {
			var target		= 'field',
				newContent	= 'new content',
				setterName	= 'set' + target.capitalize(),
				subject;

			before(function() {
				Watai.Locator.addLocator(locatorsTarget, target, { css: 'input[name="field"]' }, my.driver);
				subject = locatorsTarget[setterName](newContent);
			});

			it('should have title', function() {
				subject.should.have.property('title').with.equal('set field');
			});

			it('should have reference', function() {
				subject.should.have.property('reference').with.equal(setterName);
			});

			it('should have component', function() {
				subject.should.have.property('component').with.equal(locatorsTarget);
			});

			it('should have args', function() {
				subject.should.have.property('args').with.include(newContent);
			});
		});
	});
});
