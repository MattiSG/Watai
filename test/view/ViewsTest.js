var EventEmitter = require('events').EventEmitter;


var Watai		= require('../helpers/subject'),
	config		= require('../config'),
	stdoutSpy	= require('../helpers/StdoutSpy');


/** A simple Feature stub, to have proper parameters to pass to events.
*/
var feature = new Watai.Feature('Test feature', [], {}, require('../config'));


/** The views to test.
*/
var views = [
		'Runner/CLI',
		'Runner/Dots',
		'Runner/Flow',
		'Runner/Instafail'
	],
/** Event names mapped to the parameters expected by the event.
*/
	events = [ 'driverInit', 'start' ];



/** This test suite is written with [Mocha](http://visionmedia.github.com/mocha/) and [Should](https://github.com/visionmedia/should.js).
*/
describe('Views', function() {
	var emitter;

	before(function() {
		config.quit = 'always';
		emitter = new Watai.Runner(config);
		emitter.test();
	});

	views.forEach(function(view) {
		var subject;

		describe(view, function() {
			it('should exist', function() {
				(function() {
					var subjectClass = require(Watai.path + '/view/' + view);
					subject = new subjectClass(emitter);
				}).should.not.throw();
			});

			events.each(function(eventName) {
				describe(eventName + ' event', function() {
					before(function() {
						stdoutSpy.reset();
					});

					it('should output something', function() {
						stdoutSpy.mute();
						emitter.emit(eventName);
						stdoutSpy.unmute();
						stdoutSpy.called().should.be.true;
					});

					after(function() {
						stdoutSpy.unmute();	// keep it in the `after` handler just in case something goes wrong in the test
					});
				});
			});
		});
	});
});
