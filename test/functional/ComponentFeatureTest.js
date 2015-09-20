var Watai		= require('../unit/helpers/subject'),
	my			= require('../unit/helpers/driver').getDriverHolder(),
	testComponent	= require('../unit/helpers/testComponent'),
	config		= require('../config'),
	should		= require('should');


/** This test suite is written with [Mocha](http://visionmedia.github.com/mocha/) and [Should](https://github.com/visionmedia/should.js).
*/
describe('Component usage within Feature', function() {
	var component;

	describe('actions', function() {
		var calledMarker = '',
			partOne = 'one',
			partTwo = 'two';

		before(function() {
			component = new Watai.Component('Test component 2', Object.merge({
				setMarker: function setMarker(one) {
					calledMarker = one;
				},
				concatenateTwo: function concatenateTwo(first, second) {
					calledMarker = first + second;
				}
			}, testComponent.elements), my.driver);
		});


		it('should bind one parameter', function(done) {
			var feature = new Watai.Feature('Test feature',
				[ component.setMarker(partOne) ],
				{ TestComponent: component },
				config
			);

			feature.test().then(function() {
				try {
					should.equal(calledMarker, partOne);
					done();
				} catch (err) {
					done(err);
				}
			}, function(report) {
				done(new Error(report));
			});
		});

		it('should bind two parameters', function(done) {
			var feature = new Watai.Feature(
				'Test feature',
				[ component.concatenateTwo(partOne, partTwo) ],
				{ TestComponent: component },
				config
			);

			feature.test().then(function() {
				try {
					should.equal(calledMarker, partOne + partTwo);
					done();
				} catch (err) {
					done(err);
				}
			}, function(report) {
				done(new Error(report));
			});
		});
	});
});
