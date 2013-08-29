var EventEmitter = require('events').EventEmitter;


var Watai			= require('../helpers/subject'),
	ConfigLoader	= require('mattisg.configloader'),
	stdoutSpy		= require('../helpers/StdoutSpy');


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
	events = [ 'start', 'ready' ];



/** This test suite is written with [Mocha](http://visionmedia.github.com/mocha/) and [Should](https://github.com/visionmedia/should.js).
*/
describe('Views', function() {
	var emitter;

	before(function(done) {
		var config = new ConfigLoader({
			from		: __dirname,
			appName		: 'watai',
			override	: { quit: 'always' },
			visitAlso	: '../../src'
		}).load('config');

		this.timeout(config.browserWarmupTime);

		emitter = new Watai.Runner(config);
		emitter.test().done(function() {
			done();
		}, function(err) {
			console.log('Additional error information:', err.data);
			done(err);
		});
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
