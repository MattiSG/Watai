var growl;
try {
	growl = require('growl');
} catch (e) {
	growl = function() {};
	console.warn('Unable to load the "growl" module, will not define any Growl support.');
}

/** Notifies the user of the result of a Runner evaluation.
*
*@class
*/
var RunnerGrowl = new Class({
	Extends: require('../PromiseView'),

	showFailure: function showFailure(reason) {
		this.show((this.getErrorDescription(reason).title || 'failure'.count(Object.getLength(reason))), {
			title:		this.model + ' failed',
			priority:	4
		});
	},

	showSuccess: function showSuccess() {
		this.show('scenario'.count(this.model.scenarios.length) + ' passed', {
			title: this.model + ' succeeded'
		});
	},

	/** Returns the name of the browser that was used by the runner this view is for, properly capitalized.
	*
	*@returns	{String}
	*/
	getBrowserName: function getBrowserName() {
		return this.model.config.driverCapabilities.browserName.capitalize();
	},

	/** Displays a Growl notification, appending additional and default information
	*
	*@param	{String}	message	The content to present to the user.
	*@param	{Hash}		options	Options to pass to the `growl` method.
	*@see	{@link https://github.com/visionmedia/node-growl|node-growl}
	*/
	show: function show(message, options) {
		var defaults = {
			name:		'Watai',
			image:		this.getBrowserName(),
			priority:	3
		};

		message += ' under ' + this.getBrowserName();

		growl(message, Object.merge(defaults, options));
	}
});


module.exports = RunnerGrowl;	// CommonJS export
