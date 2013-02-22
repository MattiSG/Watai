var animator = require('../../../src/lib/cli-animator');

var ViewsManager = require('../ViewsManager');


var FeatureCLI = new Class(/** @lends FeatureCLI# */{
	/**
	*@type	{Feature}
	*/
	feature: null,

	/** A command-line interface that outputs and formats a Feature’s events.
	*
	*@constructs
	*/
	initialize: function init(feature) {
		this.feature = feature;

		this.feature.on('start', this.onStart.bind(this));
	},

	/** Presents details of a test start to the user.
	* Attaches to resolution handlers.
	*
	*@param	{Feature}	feature	The feature that is about to start.
	*/
	onStart: function onStart() {
		animator.spin(this.feature.description);

		this.feature.promise.then(
			this.showSuccess.bind(this),
			this.showFailure.bind(this)
		).fin(this.showEnd.bind(this));
	},

	/** Presents details of a test success to the user.
	*
	*@param	{Feature}	feature	The feature whose results are given.
	*/
	showSuccess: function showSuccess() {
		animator.log('✔', 'info', this.feature.description);
	},

	/** Presents details of a test failure to the user.
	*
	*@param	{Feature}	feature	The feature whose results are given.
	*/
	showFailure: function showFailure() {
		animator.log('✘', 'warn', this.feature.description, 'warn');
	},

	/** Clears the feature spinner.
	*
	*@param	{Feature}	feature	The feature whose results are given.
	*/
	showEnd: function showEnd() {
		animator.clear();
	}
});

module.exports = FeatureCLI;	// CommonJS export
