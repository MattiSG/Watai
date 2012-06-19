var WidgetTest = require('./WidgetTest');


/** This test suite is redacted with [Mocha](http://visionmedia.github.com/mocha/) and [Should](https://github.com/visionmedia/should.js).
* It relies on some external setup, see `test/helpers` and `test/index.js`.
*/
describe('Feature', function() {
	var featureWithScenario = function featureWithScenario(scenario) {
		return new TestRight.Feature('Test feature', scenario, [ WidgetTest.testWidget ]);
	}

	var failingFeatureReason = 'It’s a trap!';
	var failingFeatureTest = function() {
		return featureWithScenario([
			function() { throw failingFeatureReason }
		]).test();
	}
	
	describe('evaluation', function() {
		it('of an empty feature should be accepted', function(done) {
			featureWithScenario([]).test().then(done);
		});

		it('of a failing function should be rejected', function(done) {
			failingFeatureTest().then(function() {
				should.fail();
			}, function() {
				done();	// can't pass it directly, Mocha complains about params not being an error…
			});
		});
		
		it('of a failing function should be rejected with reasons passed', function(done) {
			failingFeatureTest().then(function() {
				should.fail();
			}, function(reasons) {
				reasons.should.have.length(1);
				reasons[0].should.equal(failingFeatureReason);
				done();
			});
		});
	});
});
