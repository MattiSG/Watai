/**@class A work-in-progress command-line interface that outputs and formats a Feature’s events in a tree-like format.
*
* WARNING: EXPERIMENTAL. This view is provided as a help for debugging cases, but it is not ready for actual delivery yet.
*/
var FeatureVerbose = new Class({
	Extends: require('../PromiseView'),

	submodel: {
		name: 'step',
		view: require('../Step/Flow')
	},

	showStart: function showStart() {
		this.animator.log('   ┍', 'info', this.model.description);
	},

	/** Presents details of a test success to the user.
	*
	*@param	{Feature}	feature	The feature whose results are given.
	*/
	showSuccess: function showSuccess() {
		this.animator.log('✔  ┕', 'info', this.model.description);
	},

	/** Presents details of a test failure to the user.
	*
	*@param	{String}	reason	Not used, as failures are described immediately in steps.
	*/
	showFailure: function showFailure(reason) {
		this.animator.log('✘  ┕', 'warn', this.model.description, 'warn');
	}
});


module.exports = FeatureVerbose;	// CommonJS export
