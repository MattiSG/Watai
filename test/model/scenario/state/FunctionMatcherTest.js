var Watai = require('../../../helpers/subject'),
	my = require('../../../helpers/driver').getDriverHolder(),
	FunctionMatcher = Watai.matchers.FunctionMatcher,
	TestWidget;


describe('FunctionMatcher', function() {
	before(function() {
		TestWidget = require('../../../helpers/testWidget').getWidget(my.driver);
	});

	it('should pass on a function returning `true`', function(done) {
		new FunctionMatcher(function() { return true }, 'TestWidget.toggleCheckbox', { TestWidget: TestWidget })
			.test().then(function() {
				done()
			}, done).done();
	});

	it('should fail on a function returning `false`', function(done) {
		new FunctionMatcher(function() { return false }, 'TestWidget.toggleCheckbox', { TestWidget: TestWidget })
			.test().then(function() {
				done(new Error('Resolved instead of rejected!'));
			}, function(reason) {
				done();
			}
		).done();
	});

	it('should pass on a function returning a promise', function(done) {
		new FunctionMatcher(function(elm) {
					return elm.getAttribute('checked').then(function() {	// this is just a way to obtain a promise
						// do nothing
					});
				},
				'TestWidget.toggleCheckbox',
				{ TestWidget: TestWidget }
			).test().then(function() {
				done()
			}, done).done();
	});

	it('should fail on a function returning a throwing promise', function(done) {
		var expectedMessage = 'This should make it fail';

		new FunctionMatcher(function(elm) {
					return elm.getAttribute('checked').then(function() {	// this is just a way to obtain a promise
						throw expectedMessage;
					});
				},
				'TestWidget.toggleCheckbox',
				{ TestWidget: TestWidget }
			).test().then(function() {
				done(new Error('Resolved instead of rejected!'));
			}, function(reason) {
				reason.should.match(new RegExp(expectedMessage));
				done();
			}
		).done();
	});
});
