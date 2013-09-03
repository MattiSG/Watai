var Watai = require('../../../helpers/subject'),
	my = require('../../../helpers/driver').getDriverHolder(),
	ContentMatcher = Watai.matchers.ContentMatcher,
	TestWidget = require('../../../helpers/testWidget');


describe('ContentMatcher', function() {
	var widget;

	before(function() {
		widget = TestWidget.getWidget(my.driver);
	});

	describe('on existing elements', function() {
		describe('on textual content', function() {
			it('should pass on matching', function(done) {
				new ContentMatcher(TestWidget.expectedContents.id, 'TestWidget.id', { TestWidget: widget })
					.test()
					.done(function() { done() });
			});

			it('should fail on non-matching', function(done) {
				new ContentMatcher(TestWidget.expectedContents.id + 'cannot match that', 'TestWidget.id', { TestWidget: widget })
					.test()
					.done(
						function() { done(new Error('Resolved instead of rejected')) },
						function() { done() }
					);
			});
		});

		describe('on value', function() {
			it('should pass on matching', function(done) {
				new ContentMatcher(TestWidget.expectedContents.outputField, 'TestWidget.outputField', { TestWidget: widget })
					.test()
					.done(function() { done() });
			});

			it('should fail on non-matching', function(done) {
				new ContentMatcher(TestWidget.expectedContents.outputField + 'cannot match that', 'TestWidget.outputField', { TestWidget: widget })
					.test()
					.done(
						function() { done(new Error('Resolved instead of rejected')) },
						function() { done() }
					);
			});
		});
	});

	describe('on missing elements', function() {
		it('should fail', function(done) {
			new ContentMatcher('missing', 'TestWidget.missing', { TestWidget: widget })
				.test()
				.done(
					function() { done(new Error('Resolved instead of rejected')) },
					function() { done() }
				);
		});
	});
});
