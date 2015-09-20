var Watai = require('../../../helpers/subject'),
	my = require('../../../helpers/driver').getDriverHolder(),
	ContentRegExpMatcher = Watai.matchers.ContentRegExpMatcher,
	TestComponent = require('../../../helpers/testComponent');


describe('ContentRegExpMatcher', function() {
	var component;

	function shouldPass(elementName, done) {
		new ContentRegExpMatcher(/./, 'TestComponent.' + elementName, { TestComponent: component })
			.test()
			.done(function() { done() });
	}

	function shouldFail(elementName, done) {
		new ContentRegExpMatcher(/herpaderp/, 'TestComponent.' + elementName, { TestComponent: component })
			.test()
			.done(
				function() { done(new Error('Resolved instead of rejected')) },
				function() { done() }
			);
	}

	before(function() {
		component = TestComponent.getComponent(my.driver);
	});

	describe('on existing elements', function() {
		describe('on textual content', function() {
			it('should pass on matching', function(done) {
				shouldPass('id', done);
			});

			it('should fail on non-matching', function(done) {
				shouldFail('id', done);
			});
		});

		describe('on value', function() {
			it('should pass on matching', function(done) {
				shouldPass('outputField', done);
			});

			it('should fail on non-matching', function(done) {
				shouldFail('outputField', done);
			});
		});
	});

	describe('on missing elements', function() {
		it('should fail', function(done) {
			shouldFail('missing', done);
		});
	});
});
