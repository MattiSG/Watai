var promises = require('q');


var FunctionalStep = new Class({
	Extends: require('./AbstractStep'),

	/** A function, promise-returning or not, to be executed. If it throws, or returns a rejected promise, this step will fail. Otherwise, it will succeed.
	*
	*@type	{Function}
	*@private
	*/
	action: null,

	/**
	*@param	{Function}	action	A function, promise-returning or not, to be executed. If it throws, or returns a rejected promise, this step will fail. Otherwise, it will succeed.
	*/
	initialize: function init(action) {
		this.action = action;
	},

	start: function start() {
		promises.fcall(this.action)
				.done(this.succeed.bind(this), this.fail.bind(this));
	}
});


module.exports = FunctionalStep;	// CommonJS export
