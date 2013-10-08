var Watai = require('../../../helpers/subject'),
	my = require('../../../helpers/driver').getDriverHolder(),
	FunctionMatcher = Watai.matchers.FunctionMatcher,
	TestWidget;


describe('FunctionMatcher', function() {
	var MESSAGE = 'This should make it fail';


	before(function() {
		TestWidget = require('../../../helpers/testWidget').getWidget(my.driver);
	});

	it('should pass on a function returning `true`', function(done) {
		new FunctionMatcher(function() { return true }, 'TestWidget.toggleCheckbox', { TestWidget: TestWidget })
			.test()
			.done(function() { done() }, done);
	});

	it('should pass on a function returning `false`', function(done) {
		new FunctionMatcher(function() { return false }, 'TestWidget.toggleCheckbox', { TestWidget: TestWidget })
			.test()
			.done(function() { done() }, done);
	});

	it('should fail on a throwing function', function(done) {
		new FunctionMatcher(function() { throw MESSAGE }, 'TestWidget.toggleCheckbox', { TestWidget: TestWidget })
			.test()
			.done(function() {
				done(new Error('Resolved instead of rejected!'));
			}, function(reason) {
				reason.should.match(new RegExp(MESSAGE));
				done();
			});
	});

	it('should pass on a function returning a resolved promise', function(done) {
		new FunctionMatcher(function(elm) {
					return elm.getAttribute('checked').then(function() {	// this is just a way to obtain a promise
						// do nothing
					});
				},
				'TestWidget.toggleCheckbox',
				{ TestWidget: TestWidget }
			).test()
			.done(function() { done() }, done);
	});

	it('should fail on a function returning a rejected promise', function(done) {
		new FunctionMatcher(function(elm) {
					return elm.getAttribute('checked').then(function() {	// this is just a way to obtain a promise
						throw MESSAGE;
					});
				},
				'TestWidget.toggleCheckbox',
				{ TestWidget: TestWidget }
			).test()
			.done(function() {
				done(new Error('Resolved instead of rejected!'));
			}, function(reason) {
				reason.should.match(new RegExp(MESSAGE));
				done();
			});
	});
});
