/** A command-line interface that outputs and formats a Feature’s events.
*
*@class
*/
var FeatureDots = new Class(/** @lends FeatureDots# */{
	Extends: require('../PromiseView'),

	/** Presents a brief summary of a test success to the user.
	*/
	showSuccess: function showSuccess() {
		process.stdout.write('.');
	},

	/** Presents a brief summary of a test failure to the user.
	*/
	showFailure: function showFailure() {
		process.stdout.write('F');
	},

	/** Presents details of a test failure to the user.
	*/
	showFailureDetails: function showFailureDetails() {
		var result = '[FAILED] '
					+ this.model.description
					+ ':\n\t- '
					+ this.model.promise.valueOf().exception.join('\n\t- ');

		process.stdout.write(result);	// more details at <https://github.com/kriskowal/q/wiki/API-Reference>
	}
});

module.exports = FeatureDots;	// CommonJS export
