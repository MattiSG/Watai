var Watai		= require('../helpers/subject'),
	my			= require('../helpers/driver').getDriverHolder(),
	testWidget	= require('../helpers/testWidget'),
	config		= require('../config'),
	should		= require('should');


/** This test suite is written with [Mocha](http://visionmedia.github.com/mocha/) and [Should](https://github.com/visionmedia/should.js).
*/
describe('Widget usage within Feature', function() {
	var widget;

	describe('actions', function() {
		var calledMarker = '',
			partOne = 'one',
			partTwo = 'two';

		before(function() {
			widget = new Watai.Widget('Test widget 2', {
				elements: testWidget.elements,
				setMarker: function setMarker(one) {
					calledMarker = one;
				},
				concatenateTwo: function concatenateTwo(first, second) {
					calledMarker = first + second;
				}
			}, my.driver);
		});


		it('should bind one parameter', function(done) {
			var feature = new Watai.Feature('Test feature', [
					widget.setMarker(partOne)
				], { TestWidget: widget },
				config
			);

			feature.test().then(function() {
				try {
					should.equal(calledMarker, partOne);
					done();
				} catch(err) {
					done(err);
				}
			}, function(report) {
				done(new Error(report));
			});
		});

		it('should bind two parameters', function(done) {
			var feature = new Watai.Feature('Test feature', [
					widget.concatenateTwo(partOne, partTwo)
				], { TestWidget: widget },
				config
			);

			feature.test().then(function() {
				try {
					should.equal(calledMarker, partOne + partTwo);
					done();
				} catch(err) {
					done(err);
				}
			}, function(report) {
				done(new Error(report));
			});
		});
	});
});
