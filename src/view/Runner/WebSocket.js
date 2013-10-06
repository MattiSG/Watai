'use strict';

var http             = require('http'),
	WebSocketServer  = require('ws').Server,
	FeatureWebSocket = require('../Feature/WebSocket'),
	EventEmitter     = require('events').EventEmitter;

var WS_NAMESPACE = 'watai:websocket:';

/** @class A work-in-progress WebSocket interface that sends Runner's events through WebSocket.
* WARNING: EXPERIMENTAL. This view is not ready for actual delivery yet.
*/
var RunnerWebSocket = new Class(/** @lends RunnerWebSocket# */{

	Extends: require('../PromiseView'),

	/** Initialize the view.
	*
	* @param  {object} model - The model.
	*/
	initialize: function initialize(model, options) {
		this.parent(model);
		this.sender  = (options && options.sender) ? options.sender : new EventEmitter();
		this.wss     = (options && options.wss)    ? options.wss    : new WebSocketServer({port: 9999});
		this.runDate = new Date();
		this.wss.on('connection', function(socket) {
			this.sender.on('send', function(data) {
				socket.send(JSON.stringify(data));
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
	* `watai:websocket:runner:stop` as value and closes the Websocket server.
	*/
	showEnd: function showEnd() {
		this.sender.emit('send', {type: WS_NAMESPACE + 'runner:stop'});
		this.wss.close();
	}

});

module.exports = RunnerWebSocket;
