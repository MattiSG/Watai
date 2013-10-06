'use strict';

var	Watai           = require('../helpers/subject'),
	ConfigLoader    = require('mattisg.configloader'),
	WebSocket       = require('ws'),
	WebSocketServer = require('ws').Server,
	EventEmitter    = require('events').EventEmitter,
	http            = require('http'),
	util            = require('util'),
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
			if (subject.wss && subject.wss._server) subject.wss.close();
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

		it('should properly assign a custom sender event emitter', function() {
			var Sender = new Class({Extends: EventEmitter, name: 'foobar'});
			subject = new SubjectClass(emitter, {sender: new Sender()});
			subject.sender.name.should.equal('foobar');
		});

		it('should properly create the WebSocket server', function() {
			subject = new SubjectClass(emitter);
			subject.should.have.property('wss');
			subject.wss.should.be.an.instanceof(WebSocketServer);
		});

		it('should properly set a custom WebSocket server', function() {
			subject = new SubjectClass(emitter, {wss: new WebSocketServer({port: 1234})});
			subject.should.have.property('wss');
			subject.wss.should.be.an.instanceof(WebSocketServer);
		});

		it('should properly stop the WebSocket server', function(done) {
			var wss = new WebSocketServer({port: 1234}, function() {
				var spy = sandbox.spy(wss, 'close');
				subject = new SubjectClass(emitter, {wss: wss});
				subject.wss.close();
				spy.calledOnce.should.be.true;
				done();
			});
		});

		it('should properly send a WebSocket message when runner starts', function(done) {
			var wss = new WebSocketServer({port: 1234}, function() {
				subject = new SubjectClass(emitter, {wss: wss});
				var ws = new WebSocket('ws://0.0.0.0:1234');
				subject.wss.on('connection', function() {
					emitter.emit('start');
					ws.on('message', function(data) {
						data = JSON.parse(data);
						// Type is mandatory
						data.should.have.property('type');
						// Event: watai:websocket:runner:start
						if (data.type === 'watai:websocket:runner:start') {
							data.should.have.property('runDate');
							data.should.have.property('name');
						}
						// Event: watai:websocket:runner:stop
						if (data.type === 'watai:websocket:runner:stop') {
							data.should.have.keys('type');
						}
						ws.close();
					});
					ws.on('close', function(data) {
						done();
					});
				});
			});
		});

		// TODO: Must add a test to test feature message sending

	});
});
