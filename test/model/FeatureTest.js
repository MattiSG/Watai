var promises = require('q');

var WidgetTest = require('./WidgetTest');


/** This test suite is redacted with [Mocha](http://visionmedia.github.com/mocha/) and [Should](https://github.com/visionmedia/should.js).
* It relies on some external setup, see `test/helpers` and `test/index.js`.
*/
describe('Feature', function() {
	var featureWithScenario = function featureWithScenario(scenario) {
		return new TestRight.Feature('Test feature', scenario, { TestWidget: WidgetTest.testWidget });
	}	
	
	describe('evaluation', function() {
		var failureReason = 'It’s a trap!';
		var failingFeatureTest = function() {
			return featureWithScenario([
				function() { throw failureReason }
			]).test();
		}

	
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
	
	describe('scenario parsing of', function() {
		describe('functions', function() {
			it('should make functions into promises', function(done) {
				var called = false;
				
				featureWithScenario([ function() {
					called = true;
				} ]).test().then(function() {
					if (called)
						done();
					else
						done(new Error('Promise resolved without actually calling the scenario function'));
				}, function() {
					done(new Error('Feature evaluation failed, with ' + called ? '' : 'out'
									+ ' actually calling the scenario function (but that’s still an error)'));
				})
			});
			
			it('should bind arrays as arguments to previous functions', function(done) {
				var calledMarker = { called: false };	// an object rather than a simple flag, to ensure reference passing
				
				featureWithScenario([
					function(arg) {
						arg.called = true;
					},
					[ calledMarker ]	// if this test case works, the function above should set the `called` marker
				]).test().then(function() {
					if (calledMarker.called)
						done();
					else
						done(new Error('Promise resolved without actually calling the scenario function'));
				}, function() {
					done(new Error('Promise rejected with ' + calledMarker.called ? '' : 'out'
									+ ' actually calling the scenario function (but that’s still an error)'));
				});
			});
		});
	
		describe('widget states descriptions', function() {
			var expectedTexts = {};
			Object.each(WidgetTest.expectedTexts, function(text, key) {	// we need to namespace all attributes to TestWidget
				expectedTexts['TestWidget.' + key] = text;
			});
			
			
			it('should be made into promises', function() {
				var result = featureWithScenario([]).buildAssertionPromise(expectedTexts);	// weird construct, but that's just whitebox testing, necessarily made on an instance
				result.should.be.a('function');
				promises.isPromise(result()).should.be.ok;
			});
			
			it('should be parsed within a scenario', function() {
				var directCall = featureWithScenario([]).buildAssertionPromise(expectedTexts);	// weird construct, but that's just whitebox testing, necessarily made on an instance
				var featureFromScenario = featureWithScenario([ expectedTexts ]);
				
				featureFromScenario.should.have.property('steps').with.lengthOf(1);
				String(featureFromScenario.steps[0]).should.equal(String(directCall));
			});
		});
	});
});
