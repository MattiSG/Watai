var Watai = require('../helpers/subject'),
	my = require('../helpers/driver').getDriverHolder(),
	should = require('should');


/* Exported to be also used in WidgetTest.
*/
exports.checkHook = checkHook = function checkHook(subject, hookName, expectedContent) {
	it('should add a hook to the target object', function() {
		subject.should.have.property(hookName);
	});

	it('should return an object when accessed', function() {
		should(typeof subject[hookName] == 'object');	// prototype of WebDriver internal objects is not augmented
	});

	it('should have the correct text in the retrieved element', function(done) {
		subject[hookName].then(function(element) {
			return element.text();
		}).then(function(content) {
			content.should.equal(expectedContent);
		}).done(done);
	});
}

/** This test suite is redacted with [Mocha](http://visionmedia.github.com/mocha/) and [Should](https://github.com/visionmedia/should.js).
*/
describe('Hook', function() {
	var hooksTarget = new (require('events').EventEmitter)();


	describe('selector', function() {
		describe('default to css', function() {
			var hookName = 'css';

			before(function() {
				Watai.Hook.addHook(hooksTarget, hookName, '#toto', my.driver);
			});

			checkHook(hooksTarget, hookName, 'This paragraph has id toto');
		});

		describe('with ID', function() {
			var hookName = 'id';

			before(function() {
				Watai.Hook.addHook(hooksTarget, hookName, { id: 'toto' }, my.driver);
			});

			checkHook(hooksTarget, hookName, 'This paragraph has id toto');
		});

		describe('with CSS', function() {
			var hookName = 'css';

			before(function() {
				Watai.Hook.addHook(hooksTarget, hookName, { css: '.tutu' }, my.driver);
			});

			checkHook(hooksTarget, hookName, 'This paragraph has class tutu');
		});

		describe('with Xpath', function() {
			var hookName = 'xpath';

			before(function() {
				Watai.Hook.addHook(hooksTarget, hookName, { xpath: '//div[@id="selectors"]/p[3]' }, my.driver);
			});

			checkHook(hooksTarget, hookName, 'This paragraph is the third of the selectors div');
		});

		describe('with link text', function() {
			var hookName = 'linkText';

			before(function() {
				Watai.Hook.addHook(hooksTarget, hookName, { linkText: 'This paragraph is embedded in a link' }, my.driver);
			});

			checkHook(hooksTarget, hookName, 'This paragraph is embedded in a link');
		});

		it('should work on a field too', function(done) {
			var target = 'field';

			Watai.Hook.addHook(hooksTarget, target, { css: 'input[name="field"]' }, my.driver);

			hooksTarget[target].then(function(element) {
				element.getAttribute('value').then(function(content) {
					content.should.equal('Default');
				}).done(done);
			});
		});
	});

	describe('setter', function() {
		it('should set the value upon attribution', function(done) {
			var target = 'field',
				newContent = 'new content';

			Watai.Hook.addHook(hooksTarget, target, { css: 'input[name="field"]' }, my.driver);

			hooksTarget[target] = newContent;

			setTimeout(function() {	// TODO: this has to be delayed because the setter above triggers a series of async actions, and we need the evaluation to be done *after* these actions. This should be modified along with a rethink of the way the setter works.
				hooksTarget[target].then(function(element) {
					return element.getAttribute('value');
				}).then(function(content) {
					content.should.equal(newContent);
				}).done(done);
			}, 200);
		});

		describe('metadata', function() {
			var target		= 'field',
				newContent	= 'new content',
				setterName	= 'set' + target.capitalize(),
				subject;

			before(function() {
				Watai.Hook.addHook(hooksTarget, target, { css: 'input[name="field"]' }, my.driver);
				subject = hooksTarget[setterName](newContent);
			});

			it('should have title', function() {
				subject.should.have.property('title').with.equal('set field');
			});

			it('should have reference', function() {
				subject.should.have.property('reference').with.equal(setterName);
			});

			it('should have widget', function() {
				subject.should.have.property('widget').with.equal(hooksTarget);
			});

			it('should have args', function() {
				subject.should.have.property('args').with.include(newContent);
			});
		});
	});
});
