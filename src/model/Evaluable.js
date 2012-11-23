var Evaluable = new Class({
	startTime: null,
	endTime: null,

	test: function test() {
		this.promise = promises.defer();
		this.startTime = new Date();
		this.cancelled = false;

		this.before();

		this.start();

		return this.promise.promise;
	},

	before: function before() {
		// to be defined by inheriting classes
	},

	/** Called by `fail()`, before either a final fail or a retry.
	* Useful for inheriting classes, if some cleanup or preparation has to be done before restarting an evaluation, taking into account that no guarantee is ever made on the number of times `start` will be called due to timeouts.
	* To be overridden by inheriting classes.
	*
	*@abstract
	*/
	after: function after(report) {
		// to be defined by inheriting classes
	},

	start: function start() {
		// to be defined by inheriting classes
	},

	/** Immediately cancels the requested match, ignoring any timeouts.
	* The promise is left untouched, neither fulfilled nor rejected.
	*/
	cancel: function cancel() {
		this.cancelled = true;
	},

	/** Fulfill the promise.
	* To be called by inheriting classes.
	*/
	succeed: function succeed() {
		this.after();
		this.endTime = new Date();	//TODO: this should be event-driven

		if (this.cancelled)
			return;

		this.promise.resolve();
	},

	/** Reject the promise.
	* Calling this method gives no guarantee `start` won't be called again. There might be retries.
	*
	*@param	report	Information to justify the failure, either a string or an object to be later formatted by formatFailure.
	*@see	#formatFailure
	*/
	fail: function fail(report) {
		this.after(report);
		this.endTime = new Date();	//TODO: this should be event-driven

		if (this.cancelled)
			return;

		this.promise.reject();
	}
})