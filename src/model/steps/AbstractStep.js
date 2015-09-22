var promises		= require('q');


/** Time, in ms, before a failed step retries.
*
*@type	{Number}
*/
var FAILURE_RETRY_DELAY = 100;


/**@class	Abstract class that represents a scenario step.
*
* A step is a basic element in a scenario.
* This abstract class provides all the logic needed to retry an action, and to provide a promise for results.
*
*@memberOf	steps
*/
var AbstractStep = new Class( /** @lends steps.AbstractStep# */ {

	Extends: require('events').EventEmitter,

	/** Unique identifier for this type of step.
	* To be redefined by inheriting classes.
	*
	*@type	{String}
	*/
	type: 'abstract step',

	/** Time, in milliseconds, before the lack of validation is considered an actual failure.
	*
	*@type	{Number}
	*/
	timeout: null,

	/** The time at which the evaluation was first requested, to evaluate the duration.
	*
	*@type	{Date}
	*/
	startTime: null,

	/** The time at which the evaluation ended, to evaluate the duration.
	*
	*@type	{Date}
	*/
	stopTime: null,

	/** The [timeout ID](http://nodejs.org/docs/latest/api/all.html#all_settimeout_cb_ms) that makes this matcher retry.
	* Needed to be able to cancel a match request.
	*
	*@see	cancel
	*@type	{Number}
	*@private
	*/
	retryTimeoutId: -1,	// -1 is no magic value, it just helps with debugging

	/** A cancellation flag, set to true if this matcher was cancelled.
	* This is needed in case the cancellation occurs after a match was started, and we're waiting for a callback from WebDriver with the element (found or missing, doesn't matter), so that we don't do call anyone back.
	*
	*@see	cancel
	*@type	{Boolean}
	*@private
	*/
	cancelled: false,

	/** The promise for this step to be ultimately evaluated, rejected if the step fails.
	*
	*@type	{QPromise}
	*/
	promise: null,


	/** Starts the evaluation process, returning a promise that will be resolved after at most the given timeout.
	*
	*@param	{Number}	[timeout]	optional, specifies a timeout, in milliseconds, for this step to consider the lack of validation as a failure. Set to 0 to try only once. Defaults to immediate execution with no retry.
	*@returns	{QPromise}	A promise that will be either fulfilled with no value passed, or rejected with an explicative message passed.
	*/
	test: function test(timeout) {
		this.deferred		= promises.defer();
		this.startTime		= new Date();
		this.cancelled		= false;
		this.retryTimeoutId	= -1;	// -1 is no magic value, it just helps with debugging
		this.timeout		=  (typeof this.timeout == 'number'
								? this.timeout
								:  (typeof timeout == 'number'
									? timeout
									: 0
								   )
							   );

		this.onBeforeStart();

		this.promise = this.deferred.promise;

		this.emit('start', this);

		this.start();

		return this.promise;
	},

	/** Gives a human-readable description of the action this step represents.
	* To be overridden by inheriting classes.
	*
	*@returns	{String}
	*@abstract
	*@private
	*/
	toString: function toString() {
		throw new Error('A concrete step should define its own description method!'); // to be defined by inheriting classes
	},

	/** Called before a series of calls to `start`, right after a caller has asked this step to be `test`ed.
	* Useful for inheriting classes, if some cleanup or preparation has to be done once before starting an evaluation, taking into account that no guarantee is ever made on the number of times `start` will be called due to timeouts.
	* To be overridden by inheriting classes.
	*
	*@abstract
	*/
	onBeforeStart: function onBeforeStart() {
		// to be defined by inheriting classes
	},

	/** Called by `fail()`, before either a final fail or a retry.
	* Useful for inheriting classes, if some cleanup or preparation has to be done before restarting an evaluation, taking into account that no guarantee is ever made on the number of times `start` will be called due to timeouts.
	* To be overridden by inheriting classes.
	*
	*@abstract
	*/
	onFailure: function onFailure(report) {
		// to be defined by inheriting classes
	},

	/** Concrete work this step has to do.
	* To be overridden by inheriting classes.
	*
	*@abstract
	*/
	start: function start() {
		throw new Error('A concrete step should define its own start method!')
	},

	/** Immediately cancels the requested match, ignoring any timeouts.
	* The promise is rejected with a "Cancelled" error.
	*/
	cancel: function cancel() {
		this.cancelled = true;
		this.finish();
		this.deferred.reject(new Error('Cancelled'));
	},

	/** Cleans this step.
	* To be called once its promise is fulfilled.
	*
	*@private
	*/
	finish: function finish() {
		clearTimeout(this.retryTimeoutId);
		this.stopTime = new Date();
	},

	/** Fulfill the promise.
	* To be called by inheriting classes.
	*
	*@param	{*}	[data]	If passed, will be passed as the second parameter of the promise resolution, the first one being this step.
	*/
	succeed: function succeed(data) {
		if (this.cancelled)
			return;

		this.finish();

		this.deferred.resolve(this, data);
	},

	/** Reject the promise.
	* Calling this method gives no guarantee `start` won't be called again. There might be retries.
	*
	*@param	{String|Object}	report	Information to justify the failure, either a string or an object to be later formatted by formatFailure.
	*@see	formatFailure
	*/
	fail: function fail(report) {
		if (this.cancelled)
			return;

		this.onFailure(report);

		if (new Date() - this.startTime >= this.timeout) {	// the timeout has expired
			this.finish();
			this.failImmediately(report);
		} else {
			this.retryTimeoutId = setTimeout(this.start.bind(this), FAILURE_RETRY_DELAY);
		}
	},

	/** Makes this matcher fail immediately, not trying anymore.
	*
	*@param	{String|Object}	report	Information to justify the failure, either a string or an object to be later formatted by formatFailure.
	*@private
	*/
	failImmediately: function failImmediately(report) {
		var durationSeconds = (this.stopTime - this.startTime) / 1000;

		this.deferred.reject(this._formatFailure(report) + ' (tried for ' + durationSeconds.round(1) + ' s)');	// TODO: duration info formatting should be left to the view
	},

	/** Formats the given failure report.
	* This version with an underscore first checks if the given report is generated by WD. If it is, it formats it accordingly, otherwise delegating formatting to the specific formatFailure method of this instance, hopefully overwritten to be specific to its own reporting format.
	*
	*@private
	*/
	_formatFailure: function _formatFailure(report) {
		try {
			return this.formatWdError(report);
		} catch (wasNoWdError) {
			return this.formatFailure(report);
		}
	},

	/** Formats the message displayed to the user in case of a failure.
	* To be redefined by children classes, defaults to return the passed parameter.
	* May be prefixed by timeout information when actually shown to the user.
	*
	*@param	{String|Object}	report	Information to justify the failure passed to the `fail` method.
	*@see	fail
	*/
	formatFailure: function formatFailure(report) {
		return report || 'There was a failure, but no information was given about it  :-/';
	},

	/** Formats a wd-generated error for presentation to the user.
	*@example
	* `err` value passed by wd:
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
	*@example
	* {"message":"Not JSON response","data":"<html>\n<head>\n<title>Error 500 org.openqa.selenium.WebDriverException: org.openqa.selenium.WebDriverException: Cannot find matching element locator to: null\nBuild info: version: '2.33.0', revision: '4e90c97', time: '2013-05-22 15:32:38'\nSystem info: os.name: 'Mac OS X',
	*
	*@param		{WdError}	error	The error to format.
	*@returns	{String}	The formatted error.
	*@throws	If the given error can not be parsed properly.
	*/
	formatWdError: function formatWdError(error) {
		var jsonWireError = error['jsonwire-error'];	// that's a wd-generated error property with details from the Selenium server
		if (jsonWireError) {
			var handler = this['formatJsonWireError' + jsonWireError.status];	// magic methods may be provided by any inheriting class, to decorate JSONwire errors

			if (handler) {
				return handler.call(this, error.cause);
			} else {
				return jsonWireError.detail;
			}
		} else if (error.data) {	// wd-generated error, but wd couldn't parse its contents, so we'll have to do it ourselves
			return error.data	// feature prominently Selenium server's error details
						.split('WebDriverException:').getLast()	// TODO: that stuff should get logged somewhere else than the terminal rather than being completely removed
						.split('Build info')[0]	// remove all extraneous information
						.trim()
					+ ' (' + error.message + ')'; // also feature wd's message, but less prominently as it's much less interesting than the server's
		}

		throw('Could not parse passed WD error: ' + error);	// TODO: change this to something quieter once the feature has been sufficiently field-tested
	},

	/** Formats an "unknown server-side error" JsonWire error.
	*
	*@param		{JsonWireError}	error	The error to format.
	*@returns	{String}	The formatted error.
	*/
	formatJsonWireError13: function formatJsonWireError13(error) {
		return error.value.message.split('(WARNING')[0];	// clean server's detailed data
	}
});


module.exports = AbstractStep;	// CommonJS export
