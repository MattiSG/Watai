'use strict';

var WebSocketClient  = require('websocket').client,
	FeatureWebSocket = require('../Feature/WebSocket'),
	EventEmitter     = require('events').EventEmitter;

var WS_NAMESPACE = 'watai:websocket:',
	WS_HOST      = 'localhost',
	WS_PORT      = 8888;

/** @class A work-in-progress WebSocket interface that sends Runner's events through WebSocket.
* WARNING: EXPERIMENTAL. This view is not ready for actual delivery yet.
*/
var RunnerWebSocket = new Class(/** @lends RunnerWebSocket# */{

	Extends: require('../PromiseView'),

	/** Initialize the view.
	*
	* @param  {object} model - The model.
	*/
	initialize: function initialize(model) {
		this.parent(model);
		this.sender  = new EventEmitter();
		this.ws      = new WebSocketClient();
		this.runDate = new Date();
		this.initWebSocket();
	},

	initWebSocket: function initWebSocket() {
		this.ws.on('connectFailed', function(error) {
			console.log('WebSocket client connection error: ' + error.toString());
		});
		this.ws.on('connect', function(connection) {
			connection.on('error', function(error) {
				console.log('WebSocket client connected but connection error: ' + error.toString());
			});
			connection.on('close', function() {
				console.log('WebSocket client connection close');
			});
			this.sender.on('send', function(data) {
				console.log('WebSocket client sending data...');
				connection.sendUTF(JSON.stringify(data));
			});
			this.sender.on('close', function() {
				connection.close();
			});
		}.bind(this));
	},

	/** The view events.
	*
	* @type {object}
	*/
	events: {

		/** Sends a WebSocket message when Runner is ready to start.
		*
		* The WebSocket message object has the following properties:
		*
		*   - `type`        : Always set to `watai:websocket:runner:start`.
		*   - `runDate`     : The runner start date.
		*   - `name`        : The Runner name.
		*/
		ready: function onReady() {
			this.ws.connect('ws:' + WS_HOST + ':' + WS_PORT);
			this.sender.emit('send', {
				type    : WS_NAMESPACE + 'runner:start',
				runDate : this.runDate,
				name    : this.model.toString() || 'Runner'
			});
		},

		/** Assigns new properties to each feature.
		*
		* These properties are:
		*
		*   - `sender`       : `EventEmitter` instance with a `send` event that passes message to WebSocket's current connection.
		*   - `WS_NAMESPACE` : The prefix to use as namespace for WebSocket message `type` property.
		*   - `runner`       : Object containing runner data (`name` and `runDate` properties).
		*
		* @param {object} feature - The feature.
		*/
		feature: function onFeature(feature) {
			var view          = new FeatureWebSocket(feature);
			view.sender       = this.sender;
			view.WS_NAMESPACE = WS_NAMESPACE;
			view.runner       = {
				name    : this.model.toString() || 'Runner',
				runDate : this.runDate
			};
		}
	},

	/** Emits a WebSocket message containg a single `type` property with
	* `watai:websocket:runner:stop` as value and closes the client connection.
	*/
	showEnd: function showEnd() {
		this.sender.emit('send', {type: WS_NAMESPACE + 'runner:stop'});
		this.sender.emit('close');
	}

});

module.exports = RunnerWebSocket;
