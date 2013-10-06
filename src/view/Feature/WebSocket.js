'use strict';

/** @class A work-in-progress WebSocket interface that sends Feature's events through WebSocket.
* WARNING: EXPERIMENTAL. This view is not ready for actual delivery yet.
*/
var FeatureWebSocket = new Class(/** @lends FeatureWebSocket# */{

	Extends: require('../PromiseView'),

	/** Sends details of a test success.
	*
	* This will send a WebSocket message with the following properties:
	*
	*   - `type`        : Always set to `watai:websocket:feature`.
	*   - `runner`      : Object containing the related runner data (`name` and `runDate` properties).
	*   - `status`      : Always set to `success`.
	*   - `description` : The current model description.
	*/
	showSuccess: function showSuccess() {
		this.sender.emit('send', {
			type        : this.WS_NAMESPACE + 'feature',
			runner      : this.runner,
			status      : 'success',
			description : this.model.description
		});
	},

	/** Sends details of a test failure.
	*
	* This will send a WebSocket message with the following properties:
	*
	*   - `type`        : Always set to `watai:websocket:feature`.
	*   - `runner`      : Object containing the related runner data (`name` and `runDate` properties).
	*   - `status`      : Always set to `failure`.
	*   - `description` : The current model description (with feature ID).
	*   - `reason`      : The failure error description.
	*
	*  The `reason` property is an object with the following properties:
	*
	*   - `title`  : The error title
	*   - `help`   : The error help
	*   - `source` : The error source code
	*
	* This object is returned by @see PromiseView#getErrorDescription.
	*
	* @param {object} reason - The failure error
	*/
	showFailure: function showFailure(reason) {
		this.sender.emit('send', {
			type        : this.WS_NAMESPACE + 'feature',
			runner      : this.runner,
			status      : 'failure',
			description : this.model.description + ' (#' + this.model.id + ')',
			reason      : this.getErrorDescription(reason)
		});
	}

});

module.exports = FeatureWebSocket;
