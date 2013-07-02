var Watai = require('../../../helpers/subject'),
	my = require('../../../helpers/driver').getDriverHolder(),
	RegExpTextMatcher = Watai.matchers.RegExpTextMatcher,
	TestWidget;


describe('RegExpTextMatcher', function() {
	before(function() {
		TestWidget = require('../../../helpers/testWidget').getWidget(my.driver);
	});

	it('should pass on a regexp', function(done) {
		new RegExpTextMatcher(/This paragraph/, 'TestWidget.id', { TestWidget: TestWidget })
			.test().then(function() {
				done();
			}, function(reason) {
				done(new Error(reason || 'No failure message passed.'));
			}
		).done();
	});

	it('should pass on a regexp in nested nodes', function(done) {
		new RegExpTextMatcher(/(to){2}/, 'TestWidget.id', { TestWidget: TestWidget })
			.test().then(function() {
				done();
			}, function(reason) {
				done(new Error(reason || 'No failure message passed.'));
			}
		).done();
	});

	it('should fail on non-matching regexps', function(done) {
		new RegExpTextMatcher(/(tu){2}/, 'TestWidget.id', { TestWidget: TestWidget })
			.test().then(function() {
				done(new Error('Resolved instead of rejected!'));
			}, function(reason) {
				reason.should.match(/did not match/);
				done();
			}
		).done();
	});

	it('should fail on on missing elements', function(done) {
		new RegExpTextMatcher(/toto/, 'TestWidget.missing', { TestWidget: TestWidget })
			.test().then(function() {
				done(new Error('Resolved instead of rejected!'));
			}, function(reason) {
				reason.should.match(/does not exist/);
				done();
			}
		).done();
	});
});
