var Watai = require('../../../helpers/subject'),
	my = require('../../../helpers/driver').getDriverHolder(),
	VisibilityMatcher = Watai.matchers.VisibilityMatcher,
	TestComponent;


describe('VisibilityMatcher', function() {
	before(function() {
		TestComponent = require('../../../helpers/testComponent').getComponent(my.driver);
	});

	it('should pass on `true` in state descriptors on existing elements', function(done) {
		new VisibilityMatcher(true, 'TestComponent.output', { TestComponent: TestComponent })
			.test().then(function() {
				done();
			}, function(report) {
				var message = 'No failure report. See code';

				if (report && report.failures && report.failures[0])
					message = report.failures[0];

				done(new Error(message));
			}
		).done();
	});

	it('should fail on `false` in state descriptors on existing elements', function(done) {
		new VisibilityMatcher(false, 'TestComponent.output', { TestComponent: TestComponent })
			.test().then(function() {
				done(new Error('Resolved instead of rejected!'));
			}, function(reason) {
				reason.should.match(/was visible/);
				done();
			}
		).done();
	});

	it('should fail on `true` in state descriptors on missing elements', function(done) {
		new VisibilityMatcher(true, 'TestComponent.missing', { TestComponent: TestComponent })
			.test().then(function() {
				done(new Error('Resolved instead of rejected!'));
			}, function(reason) {
				reason.should.match(/was not visible/);
				done();
			}
		).done();
	});

	it('should pass on `false` in state descriptors on missing elements', function(done) {
		new VisibilityMatcher(false, 'TestComponent.missing', { TestComponent: TestComponent })
			.test().then(function() {
				done();
			}, function(reason) {
				done(new Error(reason || 'No failure message passed.'));
			}
		).done();
	});

	it('should fail on `true` in state descriptors on hidden elements', function(done) {
		new VisibilityMatcher(true, 'TestComponent.hidden', { TestComponent: TestComponent })
			.test().then(function() {
				done(new Error('Resolved instead of rejected!'));
			}, function(reason) {
				reason.should.match(/was not visible/);
				done();
			}
		).done();
	});

	it('should pass on `false` in state descriptors on hidden elements', function(done) {
		new VisibilityMatcher(false, 'TestComponent.hidden', { TestComponent: TestComponent })
			.test().then(function() {
				done();
			}, function(reason) {
				done(new Error(reason || 'No failure message passed.'));
			}
		).done();
	});
});
