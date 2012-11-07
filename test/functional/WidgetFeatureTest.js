var TestRight = require('../helpers/subject'),
	my = require('../helpers/driver').getDriverHolder(),
	testWidget = require('../helpers/testWidget'),
	should = require('should');


/** This test suite is written with [Mocha](http://visionmedia.github.com/mocha/) and [Should](https://github.com/visionmedia/should.js).
*/
describe('Widget usage within Feature', function() {
	var widget;

	describe('actions', function() {
		var calledMarker = '',
			partOne = 'one',
			partTwo = 'two';

		before(function() {
			widget = new TestRight.Widget('Test widget 2', {
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
			var feature = new TestRight.Feature('Test feature', [
					widget.setMarker,
					partOne
				], { TestWidget: widget }
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
			var feature = new TestRight.Feature('Test feature', [
					widget.concatenateTwo,
					partOne, partTwo
				], { TestWidget: widget }
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

		it('should throw if a bad number of parameters is given', function() {
			(function() {
				new TestRight.Feature('Test feature', [
						widget.concatenateTwo,
						partOne
					], { TestWidget: widget }
				);
			}).should.throw();
		});
	});
});
