var promises		= require('q'),
	ConfigManager	= require('../../lib/configManager');


/**@class	Abstract class that represents a feature step.
*
* A step is a basic element in a feature scenario.
* This abstract class provides all the logic needed to retry an action, and to provide a promise for results.
*
*@memberOf	steps
*/
var AbstractStep = new Class( /** @lends steps.AbstractStep# */ {

	Extends: require('events').EventEmitter,

	/** Time, in milliseconds, before the lack of validation is considered an actual failure.
	* Defaults to the configuration value.
	*@type	{Number}
	*/
	timeout: null,

	/** The time at which the evaluation was first requested, to evaluate the timeout.
	*@type	{Date}
	*@private
	*/
	startTime: null,

	/** The [timeout ID](http://nodejs.org/docs/latest/api/all.html#all_settimeout_cb_ms) that makes this matcher retry.
	* Needed to be able to cancel a match request.
	*
	*@see	#cancel
	*@type	{Number}
	*@private
	*/
	retryTimeoutId: -1,	// -1 is no magic value, it just helps with debugging

	/** A cancellation flag, set to true if this matcher was cancelled.
	* This is needed in case the cancellation occurs after a match was started, and we're waiting for a callback from WebDriver with the element (found or missing, doesn't matter), so that we don't do call anyone back.
	*
	*@see	#cancel
	*@type	{Boolean}
	*@private
	*/
	cancelled: false,

	/** The promise for this step to be ultimately evaluated, rejected if the step fails.
	*
	*@type	{Promise}
	*/
	promise: null,


	/** Starts the evaluation process, returning a promise that will be resolved after at most the given timeout.
	*
	*@param	{Number}	[timeout]	optional, specifies a timeout, in milliseconds, for this step to consider the lack of validation as a failure. Defaults to the `timeout` ConfigManager value. Set to 0 to try only once.
	*@returns	{Promise}	A promise that will be either fulfilled with no value passed, or rejected with an explicative message passed.
	*/
	test: function test(timeout) {
		this.deferred  = promises.defer();
		this.startTime = new Date();
		this.cancelled = false;
		this.retryTimeoutId = -1;	// -1 is no magic value, it just helps with debugging
		this.timeout = (typeof timeout == 'number'
						? timeout
						:  (typeof this.timeout == 'number'
							? this.timeout
							: ConfigManager.values.timeout)
						);

		this.onBeforeStart();

		this.promise = this.deferred.promise;

		this.emit('start', this);

		this.start();

		return this.promise;
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
	* The promise is left untouched, neither fulfilled nor rejected.
	*/
	cancel: function cancel() {
		this.cancelled = true;
		clearTimeout(this.retryTimeoutId);
	},

	/** Fulfill the promise.
	* To be called by inheriting classes.
	*
	*@param	[data]	If passed, will be passed as the second parameter of the promise resolution, the first one being this step.
	*/
	succeed: function succeed(data) {
		if (this.cancelled)
			return;

		this.deferred.resolve(this, data);
	},

	/** Reject the promise.
	* Calling this method gives no guarantee `start` won't be called again. There might be retries.
	*
	*@param	report	Information to justify the failure, either a string or an object to be later formatted by formatFailure.
	*@see	#formatFailure
	*/
	fail: function fail(report) {
		if (this.cancelled)
			return;

		this.onFailure(report);

		if (new Date() - this.startTime >= this.timeout)	// the timeout has expired
			this.failImmediately(report);
		else
			this.retryTimeoutId = setTimeout(this.start.bind(this), ConfigManager.values.matchTriesDelay);
	},

	/** Makes this matcher fail immediately, not trying anymore.
	*
	*@param	report	Information to justify the failure, either a string or an object to be later formatted by formatFailure.
	*@private
	*/
	failImmediately: function failImmediately(report) {
		var failureMessagePrefix = (this.timeout > 0 ? 'After ' + this.timeout + ' milliseconds, ' : '');

		this.deferred.reject(failureMessagePrefix + this.formatFailure(report));
	},

	/** Formats the message displayed to the user in case of a failure.
	* To be redefined by children classes, defaults to return the passed parameter.
	* May be prefixed by timeout information when actually shown to the user.
	*
	*@param	report	Information to justify the failure passed to the `fail` method.
	*@see	#fail
	*/
	formatFailure: function formatFailure(report) {
		return report || 'There was a failure, but no information was given about it  :-/';
	}
});


module.exports = AbstractStep;	// CommonJS export
