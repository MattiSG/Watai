/** A command-line interface that outputs and formats a Step's failures.
*
*@class
*/
var StepInstafail = new Class(/** @lends StepInstafail# */{
	Extends: require('../PromiseView'),

	/** Presents details of a step failure to the user.
	*
	*@param	{String}	message	The reason why the step failed.
	*/
	showFailure: function showFailure(message) {
		// stepIndex++;	// make the step index 1-based for the user	// TODO: add stepIndex back
		process.stdout.write('- ' + message + '\n');
	}
});

module.exports = StepInstafail;	// CommonJS export
