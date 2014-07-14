var ERRORS_LIST	= require('../errors');


var PromiseView = new Class(/** @lends PromiseView# */{

	/** Shortcut for views that require animation.
	*/
	animator: require('../../src/lib/cli-animator'),

	/** The model represented by this view.
	*/
	model: null,

	submodel: {
		name: '',
		view: null
	},

	/** A helper abstract view for models that offer a `promise` property and raises standard `start` and `<submodel>` events.
	*
	*@constructs
	*/
	initialize: function init(model) {
		this.model = model;

		this.model.on('start', this.onStart.bind(this));

		if (this.submodel.name) {
			this.model.on(this.submodel.name, function(submodel) {
				new this.submodel.view(submodel);
			}.bind(this));
		}

		this.attach();
	},

	/** Attaches all events defined in the this class' `events` hash.
	*/
	attach: function attach() {
		for (var key in this.events)
			this.model.on(key, this.events[key].bind(this));
	},

	/** Tries to generate a human-readable version of errors propagated from external libraries.
	*
	*@param		{Error|Object}		error	The original raised error.
	*@return	{Hash<String|Object>}	A hash with the following pairs:
	*	title:	a user-displayable explanation for the given error, or undefined if no detailed description could be found
	*	help:	a user-displayable list of possible actions to take to solve the problem
	*	source:	the original passed error
	*/
	getErrorDescription: function getErrorDescription(error) {
		var userDisplayable = {};

		if (ERRORS_LIST[error && error.code]) {	// we have provided advanced help for such an error
			userDisplayable = ERRORS_LIST[error && error.code];
		} else if (error.data) {	// unknown Selenium error, for example by SauceLabs. Do our best to format it.
			var lines = error.data.split('\n');

			userDisplayable = {
				title:	lines.shift(),
				help:	lines.join('\n')
			}
		}

		return {
			title:	userDisplayable.title,	// no default value: this is how a client can know if a detailed description was found; don't try putting `error.toString()`: some values do _not_ have a toString() method
			help:	(userDisplayable.help ? userDisplayable.help + '\n' : '')
					+ 'Get more help at <https://github.com/MattiSG/Watai/wiki/Troubleshooting>',
			source:	error
		}
	},

	/** Presents details of a test start to the user.
	* Attaches to resolution handlers.
	*/
	onStart: function onStart() {
		this.model.promise.done(
			this.showSuccess.bind(this),
			this.showFailure.bind(this)
		);
		this.model.promise.fin(this.showEnd.bind(this));

		this.showStart();
	},

	/** Presents details of a model evaluation start to the user.
	*/
	showStart: function showStart() {
		// to be redefined by inheriting classes
	},

	/** Presents details of a model success to the user.
	*/
	showSuccess: function showSuccess() {
		// to be redefined by inheriting classes
	},

	/** Presents details of a model failure to the user.
	*
	*@param	{String}	reason	The reason why the step failed.
	*/
	showFailure: function showFailure(reason) {
		// to be redefined by inheriting classes
	},

	/** Presents details of the end of model evaluation to the user.
	*/
	showEnd: function showEnd() {
		// to be redefined by inheriting classes
	}
});

module.exports = PromiseView;	// CommonJS export
