var promises =	require('q'),
	config =	require('../../lib/configManager');


/**@class	Abstract class that represents a feature step.
*
* A step is a basic element in a feature scenario.
* This abstract class provides all the logic needed to retry an action, and to provide a promise for results.
*
*@memberOf	steps
*/
var AbstractStep = new Class( /** @lends steps.AbstractStep# */ {

	Extends: Evaluable,

	/** Time, in milliseconds, before the lack of validation is considered an actual failure.
	*@type	{Number}
	*/
	timeout: 0,

	/** The [timeout ID](http://nodejs.org/docs/latest/api/all.html#all_settimeout_cb_ms) that makes this matcher retry.
	* Needed to be able to cancel a match request.
	*
	*@see	#cancel
	*@type	{Number}
	*@private
	*/
	retryTimeoutId: -1,	// -1 is no magic value, it just helps with debugging


	/** Starts the evaluation process, returning a promise that will be resolved after at most the given timeout.
	*
	*@param	{Number}	[timeout]	optional, specifies a timeout, in milliseconds, for this step to consider the lack of validation as a failure. Defaults to the `timeout` config value. Set to 0 to try only once.
	*@returns	{Promise}	A promise that will be either fulfilled with no value passed, or rejected with an explicative message passed.
	*/
	before: function before() {
		this.timeout = config.values.timeout;	//TODO: get timeout
		this.retryTimeoutId = -1;	// -1 is no magic value, it just helps with debugging
	},

	/** Called before a series of calls to `start`, right after a caller has asked this step to be `test`ed.
	* Useful for inheriting classes, if some cleanup or preparation has to be done once before starting an evaluation, taking into account that no guarantee is ever made on the number of times `start` will be called due to timeouts.
	* To be overridden by inheriting classes.
	*
	*@abstract
	*/
	beforeEach: function beforeEach() {
		// to be defined by inheriting classes
	},

	/** Called by `fail()`, before either a final fail or a retry.
	* Useful for inheriting classes, if some cleanup or preparation has to be done before restarting an evaluation, taking into account that no guarantee is ever made on the number of times `start` will be called due to timeouts.
	* To be overridden by inheriting classes.
	*
	*@abstract
	*/
	afterEach: function afterEach(report) {
		// to be defined by inheriting classes
	},

	/** Concrete work this step has to do.
	* To be overridden by inheriting classes.
	*
	*@abstract
	*/
	start: function start() {
		this.beforeEach();	//TODO: find a way to have the actual start call wrapped around beforeEach and afterEach
		throw new Error('A concrete step should define its own start method!');
		this.afterEach();
	},

	/** Immediately cancels the requested match, ignoring any timeouts.
	* The promise is left untouched, neither fulfilled nor rejected.
	*/
	cancel: function cancel() {
		this.cancelled = true;	//TODO: call parent
		clearTimeout(this.retryTimeoutId);
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
			this.retryTimeoutId = setTimeout(this.start.bind(this), config.values.matchTriesDelay);
	},

	/** Makes this matcher fail immediately, not trying anymore.
	*
	*@param	report	Information to justify the failure, either a string or an object to be later formatted by formatFailure.
	*@private
	*/
	failImmediately: function failImmediately(report) {
		var failureMessagePrefix = (this.timeout > 0 ? 'After ' + this.timeout + ' milliseconds, ' : '');

		this.promise.reject(failureMessagePrefix + this.formatFailure(report));
	}
});


module.exports = AbstractStep;	// CommonJS export
