/**@class Outputs a state descriptor status.
*/
var MatcherVerbose = new Class({
	Extends: require('../PromiseView'),

	/** Presents details of a test success to the user.
	*/
	showSuccess: function showSuccess() {
		this.animator.log('      ┝  ✓', 'info', this.model);
	},

	/** Presents details of a test failure to the user.
	*
	*@param	{String}	reason	Details on the failure.
	*/
	showFailure: function showFailure(reason) {
		this.animator.log('      ┝  ✗', 'warn', reason);
	}
});


module.exports = MatcherVerbose;	// CommonJS export
