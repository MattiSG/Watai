var TestRight = require('../helpers/subject'),
	my = require('../helpers/driver').getDriverHolder(),
	expectedOutputs = require('../helpers/testWidget').expectedOutputs,
	TestWidget;


/** This test suite is redacted with [Mocha](http://visionmedia.github.com/mocha/) and [Should](https://github.com/visionmedia/should.js).
*/
describe('Matchers', function() {
	var featureWithScenario;

	before(function() {
		TestWidget = require('../helpers/testWidget').getWidget(my.driver);

		featureWithScenario = function featureWithScenario(scenario) {
			return new TestRight.Feature('Test feature', scenario, { TestWidget: TestWidget });
		}
	});


	describe('visibility', function() {
		it('should pass on `true` in state descriptors on existing elements', function(done) {
			featureWithScenario([
				{ 'TestWidget.output': true }
			]).test().then(done, function(report) {
				var message = 'No failure report. See code';

				if (report && report.failures && report.failures[0])
					message = report.failures[0];

				done(new Error(message));
			}).end();
		});

		it('should fail on `false` in state descriptors on existing elements', function(done) {
			featureWithScenario([
				{ 'TestWidget.output': false }
			]).test().then(function() {
					done(new Error('Resolved instead of rejected!'));
				}, function(reasons) {
					try {
						reasons.errors.should.have.length(0);
						reasons.failures.should.have.length(1);
						reasons.failures[0].should.match(/was visible/);
						done();
					} catch (err) {
						done(err);
					}
				}
			).end();
		});

		it('should fail on `true` in state descriptors on missing elements', function(done) {
			featureWithScenario([
				{ 'TestWidget.missing': true }
			]).test().then(function() {
					done(new Error('Resolved instead of rejected!'));
				}, function(reasons) {
					reasons.errors.should.have.length(0);
					reasons.failures.should.have.length(1);
					reasons.failures[0].should.match(/was not visible/);
					done();
				}
			).end();
		});

		it('should pass on `false` in state descriptors on missing elements', function(done) {
			featureWithScenario([
				{ 'TestWidget.missing': false }
			]).test().then(done, function(reasons) {
				var message = 'No failure report. See code';

				if (report && report.failures && report.failures[0])
					message = report.failures[0];

				done(new Error(message));
			}).end();
		});

		it('should fail on `true` in state descriptors on hidden elements', function(done) {
			featureWithScenario([
				{ 'TestWidget.hidden': true }
			]).test().then(function() {
					done(new Error('Resolved instead of rejected!'));
				}, function(reasons) {
					reasons.errors.should.have.length(0);
					reasons.failures.should.have.length(1);
					reasons.failures[0].should.match(/was not visible/);
					done();
				}
			).end();
		});

		it('should pass on `false` in state descriptors on hidden elements', function(done) {
			featureWithScenario([
				{ 'TestWidget.hidden': false }
			]).test().then(done, function(reasons) {
				var message = 'No failure report. See code';

				if (report && report.failures && report.failures[0])
					message = report.failures[0];

				done(new Error(message));
			}).end();
		});
	});


	describe('regexp-text', function() {
		it('should pass on a regexp', function(done) {
			featureWithScenario([
				{ 'TestWidget.id': /This paragraph/ }
			]).test().then(done, function(report) {
				var message = 'No failure report. See code';

				if (report && report.failures && report.failures[0])
					message = report.failures[0];

				done(new Error(message));
			}).end();
		});

		it('should pass on a regexp in nested nodes', function(done) {
			featureWithScenario([
				{ 'TestWidget.id': /(to){2}/ }
			]).test().then(done, function(report) {
				var message = 'No failure report. See code';

				if (report && report.failures && report.failures[0])
					message = report.failures[0];

				done(new Error(message));
			}).end();
		});

		it('should fail on non-matching regexps', function(done) {
			featureWithScenario([
				{ 'TestWidget.id': /(tu){2}/ }
			]).test().then(function() {
					done(new Error('Resolved instead of rejected!'));
				}, function(reasons) {
					reasons.errors.should.have.length(0);
					reasons.failures.should.have.length(1);
					reasons.failures[0].should.match(/did not match/);
					done();
				}
			).end();
		});

		it('should fail on on missing elements', function(done) {
			featureWithScenario([
				{ 'TestWidget.missing': /toto/ }
			]).test().then(function() {
					done(new Error('Resolved instead of rejected!'));
				}, function(reasons) {
					reasons.errors.should.have.length(0);
					reasons.failures.should.have.length(1);
					reasons.failures[0].should.match(/does not exist/);
					done();
				}
			).end();
		});
	});

	describe('regexp-value', function() {
		it('should pass on a regexp', function(done) {
			featureWithScenario([
				{ 'TestWidget.regexpTestField': /defau/i }
			]).test().then(done, function(report) {
				var message = 'No failure report. See code';

				if (report && report.failures && report.failures[0])
					message = report.failures[0];

				done(new Error(message));
			}).end();
		});

		it('should fail on non-matching regexps', function(done) {
			featureWithScenario([
				{ 'TestWidget.id': /(tu){2}/ }
			]).test().then(function() {
					done(new Error('Resolved instead of rejected!'));
				}, function(reasons) {
					reasons.errors.should.have.length(0);
					reasons.failures.should.have.length(1);
					reasons.failures[0].should.match(/did not match/);
					done();
				}
			).end();
		});

		it('should fail on on missing elements', function(done) {
			featureWithScenario([
				{ 'TestWidget.missing': /toto/ }
			]).test().then(function() {
					done(new Error('Resolved instead of rejected!'));
				}, function(reasons) {
					reasons.errors.should.have.length(0);
					reasons.failures.should.have.length(1);
					reasons.failures[0].should.match(/does not exist/);
					done();
				}
			).end();
		});
	});

	describe('function', function() {
		it('should pass on a function returning `true`', function(done) {
			featureWithScenario([
				{ 'TestWidget.toggleCheckbox': function() { return true } }
			]).test().then(function() { done() }, done).end();
		});

		it('should fail on a function returning `false`', function(done) {
			featureWithScenario([
				{ 'TestWidget.toggleCheckbox': function() { return false } }
			]).test().then(function() {
				done(new Error('Should have failed!'));
			}, function() {
				done();
			}).end();
		});

		it('should pass on a function returning a promise', function(done) {
			featureWithScenario([
				{ 'TestWidget.toggleCheckbox': function(elm) {
					return elm.getAttribute('checked').then(function() {	// this is just a way to obtain a promise
						// do nothing
					});
				} }
			]).test().then(function() { done() }, done).end();
		});

		it('should fail on a function returning a throwing promise', function(done) {
			var expectedMessage = 'This should make it fail';

			featureWithScenario([
				{ 'TestWidget.toggleCheckbox': function(elm) {
					return elm.getAttribute('checked').then(function() {	// this is just a way to obtain a promise
						throw expectedMessage;
					});
				} }
			]).test().then(function() {
				done(new Error('Should have failed!'));
			}, function(reasons) {
				reasons.errors.should.have.length(0);
				reasons.failures.should.have.length(1);
				reasons.failures[0].should.match(new RegExp(expectedMessage));
				done();
			}).end();
		});
	});
});
