var Watai = require('../../../helpers/subject'),
	my = require('../../../helpers/driver').getDriverHolder(),
	VisibilityMatcher = Watai.matchers.VisibilityMatcher,
	TestWidget;


describe('VisibilityMatcher', function() {
	before(function() {
		TestWidget = require('../../../helpers/testWidget').getWidget(my.driver);
	});

	it('should pass on `true` in state descriptors on existing elements', function(done) {
		new VisibilityMatcher(true, 'TestWidget.output', { TestWidget: TestWidget })
			.test().then(function() {
				done();
			}, function(report) {
				var message = 'No failure report. See code';

				if (report && report.failures && report.failures[0])
					message = report.failures[0];

				done(new Error(message));
			}
		).end();
	});

	it('should fail on `false` in state descriptors on existing elements', function(done) {
		new VisibilityMatcher(false, 'TestWidget.output', { TestWidget: TestWidget })
			.test().then(function() {
				done(new Error('Resolved instead of rejected!'));
			}, function(reason) {
				reason.should.match(/was visible/);
				done();
			}
		).end();
	});

	it('should fail on `true` in state descriptors on missing elements', function(done) {
		new VisibilityMatcher(true, 'TestWidget.missing', { TestWidget: TestWidget })
			.test().then(function() {
				done(new Error('Resolved instead of rejected!'));
			}, function(reason) {
				reason.should.match(/was not visible/);
				done();
			}
		).end();
	});

	it('should pass on `false` in state descriptors on missing elements', function(done) {
		new VisibilityMatcher(false, 'TestWidget.missing', { TestWidget: TestWidget })
			.test().then(function() {
				done();
			}, function(reason) {
				done(new Error(reason || 'No failure message passed.'));
			}
		).end();
	});

	it('should fail on `true` in state descriptors on hidden elements', function(done) {
		new VisibilityMatcher(true, 'TestWidget.hidden', { TestWidget: TestWidget })
			.test().then(function() {
					done(new Error('Resolved instead of rejected!'));
			}, function(reason) {
					reason.should.match(/was not visible/);
					done();
			}
		).end();
	});

	it('should pass on `false` in state descriptors on hidden elements', function(done) {
		new VisibilityMatcher(false, 'TestWidget.hidden', { TestWidget: TestWidget })
			.test().then(function() {
				done();
			}, function(reason) {
				done(new Error(reason || 'No failure message passed.'));
			}
		).end();
	});
});
