var Watai = require('../../../helpers/subject'),
	my = require('../../../helpers/driver').getDriverHolder(),
	FunctionMatcher = Watai.matchers.FunctionMatcher,
	TestComponent;


describe('FunctionMatcher', function() {
	var MESSAGE = 'This should make it fail';


	before(function() {
		TestComponent = require('../../../helpers/testComponent').getComponent(my.driver);
	});

	it('should pass on a function returning `true`', function(done) {
		new FunctionMatcher(function() { return true }, 'TestComponent.toggleCheckbox', { TestComponent: TestComponent })
			.test()
			.done(function() { done() }, done);
	});

	it('should pass on a function returning `false`', function(done) {
		new FunctionMatcher(function() { return false }, 'TestComponent.toggleCheckbox', { TestComponent: TestComponent })
			.test()
			.done(function() { done() }, done);
	});

	it('should fail on a throwing function', function(done) {
		new FunctionMatcher(function() { throw MESSAGE }, 'TestComponent.toggleCheckbox', { TestComponent: TestComponent })
			.test()
			.done(function() {
				done(new Error('Resolved instead of rejected!'));
			}, function(reason) {
				reason.should.match(new RegExp(MESSAGE));
				done();
			});
	});

	it('should pass on a function returning a resolved promise', function(done) {
		new FunctionMatcher(
			function(elm) {
				return elm.getAttribute('checked').then(function() {	// this is just a way to obtain a promise
					// do nothing
				});
			},
			'TestComponent.toggleCheckbox',
			{ TestComponent: TestComponent }
		).test()
		.done(function() { done() }, done);
	});

	it('should fail on a function returning a rejected promise', function(done) {
		new FunctionMatcher(
			function(elm) {
				return elm.getAttribute('checked').then(function() {	// this is just a way to obtain a promise
					throw MESSAGE;
				});
			},
			'TestComponent.toggleCheckbox',
			{ TestComponent: TestComponent }
		).test()
		.done(function() {
			done(new Error('Resolved instead of rejected!'));
		}, function(reason) {
			reason.should.match(new RegExp(MESSAGE));
			done();
		});
	});
});
