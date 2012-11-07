var promises = require('q');


var FunctionalStep = new Class({
	Extends: require('./AbstractStep'),

	/**
	*@param	{Function}	action	A function, promise-returning or not, to be executed. If it throws, or returns a rejected promise, this step will fail. Otherwise, it will succeed.
	*@param	{Array}	params	Parameters to pass to the action.
	*/
	initialize: function init(action, params) {
		this.action = action.apply.bind(action, null, params);
	},

	start: function start() {
		promises.fcall(this.action)
				.then(this.succeed.bind(this),	// we can't second-guess anything from the returned value, so as long as it didn't throw, we'll consider it worked
					  this.fail.bind(this));
	}
});


module.exports = FunctionalStep;	// CommonJS export
