/**@class A work-in-progress command-line interface that outputs and formats steps events in a tree-like format.
*
* WARNING: EXPERIMENTAL. This view is provided as a help for debugging cases, but it is not ready for actual delivery yet.
*/
var StepVerbose = new Class({
	Extends: require('../PromiseView'),

	events: {
		descriptor: function(promise, elementName, expected) {
			promise.then(
				this.animator.log.bind(this.animator, '   ┝✓', 'info', 'matched "' + elementName + '" to ' + expected),
				this.animator.log.bind(this.animator, '   ┝✗', 'warn', 'could not match "' + elementName + '" to ' + expected, 'warn')
			);
		}
	},

	/** Presents details of a test success to the user.
	*/
	showSuccess: function showSuccess() {
		this.animator.log('   ┝', 'info', /*'step ' + stepIndex + */' passed');
	},

	/** Presents details of a test failure to the user.
	*
	*@param	{Array.<String>}	reasons	Details on the failure.
	*/
	showFailure: function showFailure(reasons) {
		reasons.each(function(reason) {
			this.animator.log('   ┝', 'cyan', reason, 'cyan');
		}, this);
	}
});


module.exports = StepVerbose;	// CommonJS export
