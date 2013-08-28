var Watai = require('../../../helpers/subject'),
	my = require('../../../helpers/driver').getDriverHolder(),
	RegExpValueMatcher = Watai.matchers.RegExpValueMatcher,
	TestWidget;


describe('RegExpValueMatcher', function() {
	before(function() {
		TestWidget = require('../../../helpers/testWidget').getWidget(my.driver);
	});

	it('should pass on a regexp', function(done) {
		new RegExpValueMatcher(/defau/i, 'TestWidget.regexpTestField', { TestWidget: TestWidget })
			.test().then(function() {
				done();
			}, function(reason) {
				done(new Error(reason || 'No failure message passed.'));
			}
		).done();
	});

	it('should fail on non-matching regexps', function(done) {
		new RegExpValueMatcher(/(tu){2}/, 'TestWidget.id', { TestWidget: TestWidget })
			.test().then(function() {
				done(new Error('Resolved instead of rejected!'));
			}, function(reason) {
				reason.should.match(/did not match/);
				done();
			}
		).done();
	});

	it('should fail on missing elements', function(done) {
		new RegExpValueMatcher(/toto/, 'TestWidget.missing', { TestWidget: TestWidget })
			.test().then(function() {
				done(new Error('Resolved instead of rejected!'));
			}, function(reason) {
				reason.should.match(/was not found/);
				reason.should.not.match(/instead of/);	// ensure the message does not pretend a missing element has a value
				done();
			}
		).done();
	});
});
