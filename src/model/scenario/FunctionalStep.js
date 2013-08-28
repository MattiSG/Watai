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
	* Example `err` value passed by wd:
	*	 {
			"message":"Error response status: 13.",
			"status":13,
			"cause": {
				"status":13,
				"sessionId":"3a4bdb19-0969-4435-99cc-bb6d12ecb699",
				"value": {
					"message":"Element is not clickable at point (58, 458). Other element would receive the click: <a href=\"#\" id=\"removeOver\">...</a> (WARNING: The server did not provide any stacktrace information)\nCommand duration or timeout: 20 milliseconds\nBuild info: version: '2.33.0', revision: '4e90c97', time: '2013-05-22 15:32:38'\nSystem info: os.name: 'Mac OS X', os.ar...
					…
					…
				}
			},
			"jsonwire-error": {
				status: 7,
  				summary: 'NoSuchElement',
  				detail: 'An element could not be located on the page using the given search parameters.'
  			}
		}
	*
	* Another example:
	* {"message":"Not JSON response","data":"<html>\n<head>\n<title>Error 500 org.openqa.selenium.WebDriverException: org.openqa.selenium.WebDriverException: Cannot find matching element locator to: null\nBuild info: version: '2.33.0', revision: '4e90c97', time: '2013-05-22 15:32:38'\nSystem info: os.name: 'Mac OS X',
	*/
	formatFailure: function formatFailure(err) {
		var jsonWireError = err['jsonwire-error'];	// that's a wd-generated error property with details from the Selenium server
		if (jsonWireError) {
			if (jsonWireError.status == 13)	// that's an "unknown server-side error"
				return err.cause.value.message.split('(WARNING')[0];	// so we need to parse the error ourselves

			return err['jsonwire-error'].detail;
		} else if (err.data) {	// wd-generated error, but wd couldn't parse its contents
			return   err.data	// feature prominently Selenium server's error details
						.split('WebDriverException:').getLast()	// TODO: that stuff should get logged somewhere else than the terminal rather than being completely removed
						.split('Build info')[0]	// remove all extraneous information
						.trim()
					+ ' (' + err.message + ')'; // also feature wd's message, but less prominently as it's much less interesting than the server's
		}

		return this.parent(err);
	}
});


module.exports = FunctionalStep;	// CommonJS export
