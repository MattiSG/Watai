/** A command-line interface that outputs and formats a Scenario’s events.
*
*@class
*/
var ScenarioDots = new Class(/** @lends ScenarioDots# */{
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
					+ '#' + this.model.id + ': '
					+ this.model.description
					+ ':\n\t- '
					+ this.model.promise.inspect().reason.join('\n\t- ')
					+ '\n';

		process.stdout.write(result);	// more details at <https://github.com/kriskowal/q/wiki/API-Reference>
	}
});

module.exports = ScenarioDots;	// CommonJS export
