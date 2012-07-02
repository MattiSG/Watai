var promises = require('q');

var WidgetTest = require('./WidgetTest');


/** This test suite is redacted with [Mocha](http://visionmedia.github.com/mocha/) and [Should](https://github.com/visionmedia/should.js).
* It relies on some external setup, see `test/helpers` and `test/index.js`.
*/
describe('Feature', function() {
	var featureWithScenario = function featureWithScenario(scenario) {
		return new TestRight.Feature('Test feature', scenario, [ WidgetTest.testWidget ]);
	}

	var failureReason = 'It’s a trap!';
	var failingFeatureTest = function() {
		return featureWithScenario([
			function() { throw failureReason }
		]).test();
	}
	
	describe('evaluation', function() {
		it('of an empty feature should be accepted', function(done) {
			featureWithScenario([]).test().then(done);
		});

		it('of a failing function should be rejected', function(done) {
			failingFeatureTest().then(function() {
					done(new Error('Resolved instead of rejected!'));
				}, function() {
					done();	// can't pass it directly, Mocha complains about param not being an error…
				}
			);
		});
		
		it('of a failing function should be rejected and reasons passed', function(done) {
			failingFeatureTest().then(function() {
					done(new Error('Resolved instead of rejected!'));
				}, function(reasons) {
					reasons.should.have.length(1);
					reasons[0].should.equal(failureReason);
					done();
				}
			);
		});
		
		it('of a failing promise should be rejected and reasons passed', function(done) {
			featureWithScenario([
				function() {
					var deferred = promises.defer();

					deferred.reject(failureReason);
					
					return deferred.promise;
				}
			]).test().then(function() {
					done(new Error('Resolved instead of rejected!'));
				}, function(reasons) {	// second callback is the error callback, that's the one we're testing a call for
					reasons.should.have.length(1);
					reasons[0].should.equal(failureReason);
					done();
				}
			);
		});
	});
});
