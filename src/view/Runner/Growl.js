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

	showFailure: function showFailure() {
		growl('Test failed  :(', { priority: 4 });
	},

	showSuccess: function showSuccess() {
		growl('Test succeeded!  :)', { priority: 3 });
	}
});


module.exports = RunnerGrowl;	// CommonJS export
