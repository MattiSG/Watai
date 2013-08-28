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
			title:		'Test failed',
		this.show((this.getErrorDescription(reason).title || 'failure'.count(Object.getLength(reason))), {
			priority:	4
		});
	},

	showSuccess: function showSuccess() {
		this.show('feature'.count(this.model.features.length) + ' passed', {
			title: 'Test succeeded'
		});
	},

	show: function show(content, options) {
		var defaults = {
			name:		'Watai',
			image:		this.model.config.driverCapabilities.browserName.capitalize(),
			priority:	3
		};

		growl(content, Object.merge(defaults, options));
	}
});


module.exports = RunnerGrowl;	// CommonJS export
