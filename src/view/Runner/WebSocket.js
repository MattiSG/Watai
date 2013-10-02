'use strict';

var http             = require('http'),
	WebSocketServer  = require('ws').Server,
	FeatureWebSocket = require('../Feature/WebSocket'),
	wsNamespace      = 'watai:websocket:',
	EventEmitter     = require('events').EventEmitter;


/**
 * @class A work-in-progress WebSocket interface that sends Runner's events through WebSocket.
 * WARNING: EXPERIMENTAL. This view is not ready for actual delivery yet.
 */
var RunnerWebSocket = new Class(/** @lends RunnerWebSocket# */{

	Extends: require('../PromiseView'),

	/**
	 * Initialize the view.
	 * @param  {object} model - The model
	 */
	initialize: function initialize(model, options) {
		var self     = this;
		this.sender  = (options && options.sender) ? options.sender : new EventEmitter();
		this.wss     = (options && options.wss)    ? options.wss    : new WebSocketServer({port: 9999});
		this.runDate = new Date();
		this.wss.on('connection', function(socket) {
			self.sender.on('send', function(data) {
				socket.send(JSON.stringify(data));
			});
		});
		this.parent(model);
	},

	/**
	 * The view events.
	 * @type {object}
	 */
	events: {

		/**
		 * Sends a WebSocket message when Runner is ready to start.
		 *
		 * The WebSocket message object has the following properties:
		 *
		 *   - `type`        : Always set to `watai:websocket:runner`
		 *   - `action`      : Always set to `start` for this event
		 *   - `runDate`     : The runner start date
		 *   - `name`        : The Runner name
		 */
		ready: function onReady() {
			var self = this;
			self.sender.emit('send', {
				type    : wsNamespace + 'runner:start',
				runDate : self.runDate,
				name    : self.model.toString() ? self.model.toString() : 'Runner'
			});
		},

		/**
		 * Assigns new properties to each feature.
		 *
		 * These properties are:
		 *
		 *   - `sender`      : `EventEmitter` instance with a `send` event that passes message to WebSocket's current connection
		 *   - `wsNamespace` : The prefix to use as namespace for WebSocket message `type` property
		 *   - `runDate`     : The test suite running date (when this runner starts)
		 *
		 * @param {object} feature - The feature
		 */
		feature: function onFeature(feature) {
			var view         = new FeatureWebSocket(feature);
			view.sender      = this.sender;
			view.wsNamespace = wsNamespace;
			view.runDate     = this.runDate;
		}
	},

	/**
	 * Emits a WebSocket message containg a single `type` property with
	 * `watai:websocket:runner:stop` as value and closes the Websocket server.
	 */
	showEnd: function showEnd() {
		this.sender.emit('send', {type: wsNamespace + 'runner:stop'});
		this.wss.close();
	}

});

module.exports = RunnerWebSocket;
