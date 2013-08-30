/**@class A work-in-progress command-line interface that outputs and formats steps events in a tree-like format.
*
* WARNING: EXPERIMENTAL. This view is provided as a help for debugging cases, but it is not ready for actual delivery yet.
*/
var StepVerbose = new Class({
	Extends: require('../PromiseView'),

	events: {
		descriptor: function(promise, elementName, expected) {
			var expectedDescription	= expected.name || expected.description || expected,
				elementDescription	= elementName.replace('.', '’s ')

			promise.then(
				this.animator.log.bind(this.animator, '      ┝ ✓', 'info', elementDescription + ' matches ' + expectedDescription),
				this.animator.log.bind(this.animator, '      ┝ ✗', 'warn', elementDescription + ' does not match ' + expectedDescription, 'warn')
			);
		}
	},

	/** Presents details of a test success to the user.
	*/
	showSuccess: function showSuccess() {
		this.animator.log('      ┝', 'info', this.model.getDescription() + ' passed');
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
