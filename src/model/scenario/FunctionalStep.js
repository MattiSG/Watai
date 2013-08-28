var FunctionalStep = new Class({
	Extends: require('./AbstractStep'),

	/**
	*@param	{Function}	action	A function, promise-returning or not, to be executed. If it throws, or returns a rejected promise, this step will fail. Otherwise, it will succeed.
	*/
	initialize: function init(action) {
		this.action = action;
	},

	start: function start() {
		var result;

		try {
			result = this.action();	// unfortunately, due to WebDriverJS' Promises/A implementation, we can't promises.fcall(this.action) and have to redo its logic
		} catch (err) {
			return this.fail(err);
		}

		if (result && result.then) {	// that was a promise, wait for it to be resolved
			result.done(this.succeed.bind(this),
						this.fail.bind(this));
		} else {	// we can't second-guess anything from the returned value, so as long as it didn't throw, we'll consider it worked
			this.succeed(result);
		}
	},

	/*
	*Example `err` value passed by wd:
	*	 {
			"message":"Error response status: 13.",
			"status":13,
			"cause": {
				"status":13,
				"sessionId":"3a4bdb19-0969-4435-99cc-bb6d12ecb699",
				"value": {
					"message":"Element is not clickable at point (58, 458). Other element would receive the click: <a href=\"#\" id=\"removeOver\">...</a> (WARNING: The server did not provide any stacktrace information)\nCommand duration or timeout: 20 milliseconds\nBuild info: version: '2.33.0', revision: '4e90c97', time: '2013-05-22 15:32:38'\nSystem info: os.name: 'Mac OS X', os.ar...
	*/
	formatFailure: function formatFailure(err) {
		if (err.cause)	// that's a wd-generated error
			return err.cause.value.message.split('(WARNING')[0];	// clean up the message forwarded from Selenium server

		return this.parent(err);
	}
});


module.exports = FunctionalStep;	// CommonJS export
