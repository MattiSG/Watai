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

	/** Presents details of a test start to the user.
	* Attaches to resolution handlers.
	*
	*@param	model	The model that is about to start.
	*/
	onStart: function onStart() {
		this.model.promise.then(
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
	*@param	{String}	message	The reason why the step failed.
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
