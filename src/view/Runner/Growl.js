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
		this.show('feature'.count(this.model.features.length) + ' passed', {
			title: this.model + ' succeeded'
		});
	},

	getBrowserName: function getBrowserName() {
		return this.model.config.driverCapabilities.browserName.capitalize();
	},

	show: function show(content, options) {
		var defaults = {
			name:		'Watai',
			image:		this.getBrowserName(),
			priority:	3
		};

		content += ' under ' + this.getBrowserName();

		growl(content, Object.merge(defaults, options));
	}
});


module.exports = RunnerGrowl;	// CommonJS export
