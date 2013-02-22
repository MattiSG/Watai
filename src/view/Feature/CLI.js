/** A command-line interface that outputs and formats a Feature’s events.
*
*@class
*/
var FeatureCLI = new Class(/** @lends FeatureCLI# */{
	Extends: require('../PromiseView'),

	submodel: {
		name: 'step',
		view: require('../Step/CLI')
	},

	events: {
		start: function() {
			this.animator.spin(this.model.description);
		}
	},

	/** Presents details of a test success to the user.
	*/
	showSuccess: function showSuccess() {
		this.animator.log('✔', 'info', this.model.description);
	},

	/** Presents details of a test failure to the user.
	*/
	showFailure: function showFailure() {
		this.animator.log('✘', 'warn', this.model.description, 'warn');
	},

	/** Clears the feature spinner.
	*/
	showEnd: function showEnd() {
		this.animator.clear();
	}
});

module.exports = FeatureCLI;	// CommonJS export
