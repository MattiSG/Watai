'use strict';

var http                 = require('http'),
	WebSocketServer      = require('ws').Server,
	FeatureWebSocketView = require('../Feature/WebSocket'),
	wsNamespace          = 'watai:websocket:',
	events               = require('events'),
	sender               = new events.EventEmitter();


var RunnerWebSocketView = new Class({

	Extends: require('../PromiseView'),

	initialize: function initialize(model) {
		this.httpServer = http.createServer();
		this.wss        = new WebSocketServer({server: this.httpServer});
		this.runDate    = new Date();
		this.httpServer.listen(9999);
		this.wss.on('connection', function(ws) {
			sender.on('send', function(data) {
				ws.send(JSON.stringify(data));
			});
		});
		this.parent(model);
	},

	events: {
		ready: function onReady() {
			var self = this;
			sender.emit('send', {
				type    : wsNamespace + 'runner',
				action  : 'start',
				runDate : self.runDate,
				name    : self.model.toString()
			});
		},
		feature: function onFeature(feature) {
			var view         = new FeatureWebSocketView(feature);
			view.sender      = sender;
			view.wsNamespace = wsNamespace;
			view.runDate     = this.runDate;
		}
	}
});

module.exports = RunnerWebSocketView;
