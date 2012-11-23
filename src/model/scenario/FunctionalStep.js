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
		var result;

		try {
			result = this.action();	// unfortunately, due to WebDriverJS' Promises/A implementation, we can't promises.fcall(this.action) and have to redo its logic
		} catch (err) {
			return this.fail(err);
		}

		if (result && result.then) {	// that was a promise, wait for it to be resolved
			result.then(this.succeed.bind(this),
						this.fail.bind(this));
		} else {	// we can't second-guess anything from the returned value, so as long as it didn't throw, we'll consider it worked
			this.succeed(result);
		}
	}
});


module.exports = FunctionalStep;	// CommonJS export
