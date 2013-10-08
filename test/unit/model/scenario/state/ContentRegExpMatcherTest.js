var Watai = require('../../../helpers/subject'),
	my = require('../../../helpers/driver').getDriverHolder(),
	ContentRegExpMatcher = Watai.matchers.ContentRegExpMatcher,
	TestWidget = require('../../../helpers/testWidget');


describe('ContentRegExpMatcher', function() {
	var widget;

	function shouldPass(elementName, done) {
		new ContentRegExpMatcher(/./, 'TestWidget.' + elementName, { TestWidget: widget })
			.test()
			.done(function() { done() });
	}

	function shouldFail(elementName, done) {
		new ContentRegExpMatcher(/herpaderp/, 'TestWidget.' + elementName, { TestWidget: widget })
			.test()
			.done(
				function() { done(new Error('Resolved instead of rejected')) },
				function() { done() }
			);
	}

	before(function() {
		widget = TestWidget.getWidget(my.driver);
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
