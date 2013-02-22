var animator = require('../../../src/lib/cli-animator');


var StepCLI = new Class(/** @lends StepCLI# */{
	/**
	*@type	{Feature}
	*/
	step: null,

	/** A command-line interface that outputs and formats a step’s events.
	*
	*@constructs
	*/
	initialize: function init(step) {
		this.step = step;

		this.step.on('start', this.onStart.bind(this));
	},

	/** Presents details of a test start to the user.
	* Attaches to resolution handlers.
	*
	*@param	{Feature}	feature	The feature that is about to start.
	*/
	onStart: function onStart() {
		this.step.promise.fail(this.showFailure.bind(this));
	},

	/** Presents details of a step failure to the user.
	*
	*@param	{String}	message	The reason why the step failed.
	*/
	showFailure: function showFailure(message) {
		//stepIndex++;	// make the step index 1-based for the user	// TODO: add stepIndex back
		animator.log('   ↳', 'cyan', message, 'cyan');
	}
});

module.exports = StepCLI;	// CommonJS export
