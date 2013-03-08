/**@class A work-in-progress command-line interface that outputs and formats a Feature’s events in a tree-like format.
*
* WARNING: EXPERIMENTAL. This view is provided as a help for debugging cases, but it is not ready for actual delivery yet.
*/
var FeatureVerbose = new Class({
	Extends: require('../PromiseView'),

	/** The amount of spaces expected for the numerical ID that will be prepended to features.
	*
	*@type	{String}
	*/
	idPlaceholder: '   ',

	submodel: {
		name: 'step',
		view: require('../Step/Flow')
	},

	showStart: function showStart() {
		this.animator.log('  ' + this.idPlaceholder + ' ┍', 'info', this.model.description, 'gray');
	},

	/** Presents details of a test success to the user.
	*
	*@param	{Feature}	feature	The feature whose results are given.
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

	/** Returns the viewed feature's numerical ID, possibly padded with spaces so that they all have the same length.
	* The length is provided by the length of the `idPlaceholder` attribute.
	*
	*@private
	*@see	#idPlaceholder
	*/
	getPaddedId: function getPaddedId() {
		var result = '' + this.model.id;

		while (result.length < this.idPlaceholder.length)
			result = ' ' + result;

		return result;
	}
});


module.exports = FeatureVerbose;	// CommonJS export
