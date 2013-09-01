/**@class A detailed step-by-step output.
*/
var StepVerbose = new Class({
	Extends: require('../PromiseView'),

	submodel: {
		name: 'matcher',
		view: require('../Matcher/Flow')
	},

	/** Presents details of a test success to the user.
	*/
	showSuccess: function showSuccess() {
		this.animator.log('      ┝', 'info', this.model.getDescription());
	},

	/** Presents details of a test failure to the user.
	*
	*@param	{String}	reason	Details on the failure.
	*/
	showFailure: function showFailure(reason) {
		this.animator.log('      ┝', 'cyan', reason, 'cyan');
	}
});


module.exports = StepVerbose;	// CommonJS export
