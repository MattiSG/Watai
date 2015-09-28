/**@class A work-in-progress command-line interface that outputs and formats a Scenario’s events in a tree-like format.
*
* WARNING: EXPERIMENTAL. This view is provided as a help for debugging cases, but it is not ready for actual delivery yet.
*/
var ScenarioVerbose = new Class({
	Extends: require('../PromiseView'),

	/** The amount of spaces expected for the numerical ID that will be prepended to Scenarios.
	*
	*@type	{String}
	*/
	idPlaceholder: '   ',

	submodel: {
		name: 'step',
		view: require('../Step/Verbose')
	},

	showStart: function showStart() {
		this.animator.log('  ' + this.getPaddedId() + ' ┍', 'gray', this.model.description, 'gray');
	},

	/** Presents details of a test success to the user.
	*
	*@param	{Scenario}	scenario	The Scenario whose results are given.
	*/
	showSuccess: function showSuccess() {
		this.animator.log('✔ ' + this.getPaddedId() + ' ┕', 'info', this.model.description);
	},

	/** Presents details of a test failure to the user.
	*
	*@param	{String}	reason	Not used, as failures are described immediately in steps.
	*/
	showFailure: function showFailure(reason) {
		this.animator.log('✘ ' + this.getPaddedId() + ' ┕', 'warn', this.model.description, 'warn');
	},

	/** Visually separates two Scenarios.
	*/
	showEnd: function showEnd() {
		process.stdout.write('\n');
	},

	/** Returns the viewed Scenario's numerical ID, possibly padded with spaces so that they all have the same length.
	* The length is provided by the length of the `idPlaceholder` attribute.
	*
	*@private
	*@see	idPlaceholder
	*/
	getPaddedId: function getPaddedId() {
		var result = '' + this.model.id;

		while (result.length < this.idPlaceholder.length)
			result = ' ' + result;

		return result;
	}
});


module.exports = ScenarioVerbose;	// CommonJS export
