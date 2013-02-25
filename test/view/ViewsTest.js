var EventEmitter = require('events').EventEmitter;

var Watai		= require('../helpers/subject'),
	stdoutSpy	= require('../helpers/StdoutSpy');


/** A simple Feature stub, to have proper parameters to pass to events.
*/
var feature = new Watai.Feature('Test feature', [], {});


/** The views to test.
*/
var views = [
		'Runner/CLI',
		'Runner/Growl',
		'Runner/Dots',
		'Runner/Flow'
	],
/** Event names mapped to the parameters expected by the event.
*/
	events = {
		beforeRun		: [],
		ready			: [],
		failure			: [],
		success			: []
	};



/** This test suite is written with [Mocha](http://visionmedia.github.com/mocha/) and [Should](https://github.com/visionmedia/should.js).
*/
xdescribe('Views', function() {

	views.forEach(function(view) {
		var emitter = new EventEmitter(),
			subject;

		describe(view, function() {
			it('should exist', function() {
				(function() {
					subject = Watai.ViewsManager.attach(view, emitter);
				}).should.not.throw();
			});

			it('should return its emitter', function() {
				subject.should.equal(emitter);
			});

			Object.each(events, function(params, eventName) {
				before(function() {
					stdoutSpy.mute();
					stdoutSpy.reset();
				});

				it('should listen to ' + eventName, function() {
					params.unshift(eventName);
					emitter.emit.apply(emitter, params);
					params.shift();	// leave the array as it was, for the next tests

					stdoutSpy.called().should.be.true;
				});

				after(function() {
					stdoutSpy.unmute();
				});
			});
		});
	});
});
