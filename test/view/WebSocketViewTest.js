'use strict';

var	Watai           = require('../helpers/subject'),
	ConfigLoader    = require('mattisg.configloader'),
	EventEmitter    = require('events').EventEmitter,
	sinon           = require('sinon');


describe('Views', function() {

	var emitter;

	before(function(done) {
		var config = new ConfigLoader({
			from		: __dirname,
			appName		: 'watai',
			override	: { quit: 'always' },
			visitAlso	: '../../src'
		}).load('config');
		this.timeout(config.browserWarmupTimeout);
		emitter = new Watai.Runner(config);
		emitter.setMaxListeners(30);
		emitter.test().done(function() {
			done();
		}, function(err) {
			console.log('Additional error information:', err.data);
			done(err);
		});
	});

	describe('WebSocket', function() {

		var SubjectClass = require(Watai.path + '/view/Runner/WebSocket');
		var subject, sandbox;

		beforeEach(function() {
			sandbox = sinon.sandbox.create();
		});

		afterEach(function() {
			sandbox.restore();
		});

		it('should exist', function() {
			(function() {
				subject = new SubjectClass(emitter);
			}).should.not.throw();
		});

		it('should properly create the sender event emitter', function() {
			subject = new SubjectClass(emitter);
			subject.should.have.property('sender');
			subject.sender.should.be.an.instanceof(EventEmitter);
		});

		// TODO: Must add a test to test feature message sending
	});
});
