'use strict';

/**
 * @class A work-in-progress WebSocket interface that sends Feature's events through WebSocket.
 * WARNING: EXPERIMENTAL. This view is not ready for actual delivery yet.
 */
var FeatureWebSocket = new Class(/** @lends FeatureWebSocket# */{

	Extends: require('../PromiseView'),

	/**
	 * Sends details of a test success.
	 *
	 * This will send a WebSocket message with the following properties:
	 *
	 *   - `type`        : Always set to `watai:websocket:feature`
	 *   - `runDate`     : The test suite running date (when `Runner` start)
	 *   - `status`      : Always set to `success`
	 *   - `description` : The current model description
	 */
	showSuccess: function showSuccess() {
		var self = this;
		this.sender.emit('send', {
			type        : self.wsNamespace + 'feature',
			runDate     : self.runDate,
			status      : 'success',
			description : self.model.description
		});
	},

	/**
	 * Sends details of a test failure.
	 *
	 * This will send a WebSocket message with the following properties:
	 *
	 *   - `type`        : Always set to `watai:websocket:feature`
	 *   - `runDate`     : The test suite running date (when `Runner` start)
	 *   - `status`      : Always set to `failure`
	 *   - `description` : The current model description (with feature ID)
	 *   - `reason`      : The failure error description
	 *
	 *  The `reason` property is an object with the following properties:
	 *
	 *   - `title`  : The error title
	 *   - `help`   : The error help
	 *   - `source` : The error source code
	 *
	 * This object is returned by `this.getErrorDescription()`.
	 *
	 * @param {object} reason - The failure error
	 */
	showFailure: function showFailure(reason) {
		var self = this;
		this.sender.emit('send', {
			type        : self.wsNamespace + 'feature',
			runDate     : self.runDate,
			status      : 'failure',
			description : self.model.description + ' (#' + self.model.id + ')',
			reason      : this.getErrorDescription(reason)
		});
	}

});

module.exports = FeatureWebSocket;
