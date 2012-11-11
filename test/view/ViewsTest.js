require('mootools');


var views = [
		'CLI',
		'Growl',
		'Dots'
	],
	events = [
		'beforeRun',
		'ready',
		'featureStart',
		'featureSuccess',
		'featureFailure',
		'featureError',
		'failure',
		'success'
	];


/** This test suite is redacted with [Mocha](http://visionmedia.github.com/mocha/) and [Should](https://github.com/visionmedia/should.js).
*/
describe('Views', function() {

	views.forEach(function(view) {
		describe(view, function() {
			var subject;

			it('should exist', function() {
				subject = require('../../src/view/Runner' + view);
				subject.should.be.a('object');
			});

			it('should offer only known events', function() {
				Object.each(subject, function(method, name) {
					events.should.include(name);
					method.should.be.a('function');
				});
			});
		});
	});
});
