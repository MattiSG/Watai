var promises = require('q');


/**@class	Abstract class from which all content matchers inherit.
*
* A _matcher_ is an object that handles state descriptors, i.e. each key/value pair in a state description object from a Feature’s scenario.
* Implementing a new matcher, i.e. offering a new content comparison type, is very easy: simply extend this class, taking example on the existing concrete matchers, and redefine at least `onElementFound`, calling `this.succeed`, `this.fail` and/or `this.compare`.
*
*@memberOf	matchers
*/
var AbstractMatcher = new Class( /** @lends matchers.AbstractMatcher# */ {

	/** The type of content this matcher can match an element on.
	*/
	type: 'abstract',

	/** Time, in milliseconds, until not having a match is considered a failure.
	*@type	{Number}
	*/
	timeout: 0,

	/** The value this matcher should look for.
	*/
	expected: undefined,

	/** The widgets in which elements should be looked for.
	*@type	{Array.<Widget>}
	*@private
	*/
	widgets: null,

	/** The first value that was retrieved from the element to match content on.
	* This allows us to detect changes and fail earlier if there was a change different from the content we're expecting.
	*@private
	*/
	original: undefined,

	/** A widget element selector, describing the element whose content is to be matched.
	*@type	{String}
	*@private
	*/
	selector: '',

	/** The time at which the evaluation was first requested, to evaluate the timeout.
	*@type	{Date}
	*@private
	*/
	startTime: null,

	/** The [timeout ID](http://nodejs.org/docs/v0.8.9/api/all.html#all_settimeout_cb_ms) that makes this matcher retry.
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


	/** Creates a matcher, ready to be evaluated.
	*
	*@param	{Array.<Widget>}	The widgets in which elements should be looked for.
	*@param	{String}	selector	The element selector to look for in this instance's referenced widgets.
	*@param	expected	Any kind of content this matcher should look for.
	*@constructs
	*@see	#test
	*/
	initialize: function init(widgets, selector, expected) {
		this.widgets = widgets;
		this.selector = selector;
		this.expected = expected;

		this.compare = this.compare.bind(this);
		this.succeed = this.succeed.bind(this);
		this.fail = this.fail.bind(this);
	},

	/** Starts the evaluation process, returning a promise for results fulfilled if there is a match, and rejected if not, after at most the given timeout.
	*
	*@param	{Number}	[timeout]	optional, specifies a timeout, in milliseconds, for this matcher to consider the lack of a match as a failure. Defaults to DEFAULT_TIMEOUT. Set to 0 to disable timeout altogether and give no chance to the pointed element to change asynchronously.
	*@returns	{Promise}	A promise that will be either fulfilled if their is a match, or rejected with the actual value passed.
	*@see	AbstractMatcher.DEFAULT_TIMEOUT
	*/
	test: function test(timeout) {
		this.promise = promises.defer();
		this.original = undefined;
		this.startTime = new Date();
		this.timeout = (typeof timeout == 'number' ? timeout : AbstractMatcher.DEFAULT_TIMEOUT);
		this.cancelled = false;
		this.retryTimeoutId = -1;	// -1 is no magic value, it just helps with debugging

		this.start();

		return this.promise.promise;
	},

	/** Starts an actual match, by trying to obtain the element pointed by this instance's selector.
	*
	*@private
	*/
	start: function start() {
		Object.getFromPath(this.widgets, this.selector)
			  .then(this.onElementFound.bind(this),	// this wrapping is needed because the promise from `getFromPath` is a WebDriver promise, so we can't add failure handlers only, we need to set all handlers at once through the `then` method
			  		this.onElementMissing.bind(this));
	},

	/** Immediately cancels the requested match, ignoring any timeouts.
	* The promise is left untouched, neither fulfilled nor rejected.
	*/
	cancel: function cancel() {
		this.cancelled = true;
		clearTimeout(this.retryTimeoutId);
	},

	/** Handler called when the selected element is found. To be redefined by subclasses.
	*
	*@param	{WD.Element}	element	The WebDriver element pointed by the selector of this instance.
	*/
	onElementFound: function onElementFound(element) {
		throw new Error('AbstractMatcher should never be used as an instance! onElementFound() has to be redefined.');
	},

	/** Handler for missing element. May be redefined by subclasses.
	* Defaults to failing.
	*
	*@param	{Error}	The error raised by WebDriver.
	*/
	onElementMissing: function onElementMissing(error) {
		this.fail('Element "' + this.selector + '" does not exist on the page.')
	},

	/** Compares the given value to the expected value, and fails or succeeds the match automatically.
	*
	*@param	actual	The value that should be compared against this instance's expected value.
	*/
	compare: function compare(actual) {
		if (actual == this.expected)
			this.succeed();
		else
			this.fail(actual);
	},

	/** Marks the match as successful.
	*/
	succeed: function succeed() {
		if (this.cancelled)
			return;

		this.promise.resolve();
	},

	/** Marks the match as failed.
	* This does not mean it will necessarily end the match: there might be timeout settings that make the matcher try again to access the element.
	*
	*@param	actual	The actual content that was found by this matcher.
	*/
	fail: function fail(actual) {
		if (this.cancelled)
			return;

		if (typeof this.original == 'undefined')
			this.original = actual;	// this is used to wait for a _change_ in the element value rather than for a match

		if (new Date() - this.startTime >= this.timeout)	// the timeout has expired
			this.failImmediately(actual);
		else
			this.retryTimeoutId = setTimeout(this.start.bind(this), AbstractMatcher.MATCH_TRY_DELAY);
	},

	/** Makes this matcher fail immediately, not trying anymore.
	*
	*@param	actual	The content that was found by this matcher. Will be used to construct a user-visible failure description.
	*@private
	*/
	failImmediately: function failImmediately(actual) {
		var failureMessagePrefix = (this.timeout > 0 ? 'After ' + this.timeout + ' milliseconds, ' : '');

		this.promise.reject(failureMessagePrefix + this.formatFailure(actual));
	},

	/** Formats the message displayed to the user in case of a failure.
	* May be redefined by children classes.
	* May be prefixed by timeout information when actually shown to the user.
	*
	*@param	actual	The actual value that was encountered.
	*/
	formatFailure: function formatFailure(actual) {
		if (typeof actual == 'undefined') {
			return 'could not determine the '
					+ this.type
					+ ' from element '
					+ this.selector
					+ '.';
		} else if (actual != this.original) {
			return this.selector
					+ ' changed its value to "'
					+ actual
					+ '" rather than to "'
					+ this.expected
					+ '".';
		} else {
			return this.selector
					+ "'s "
					+ this.type
					+ ' was'
					+ (this.timeout > 0 ? ' still "' : ' "')
					+ actual
					+ '" instead of "'
					+ this.expected
					+ '".';
		}
	}
});


/** How long to wait until the lack of a match is considered as a failure, unless more precision is given at the time of testing.
* Expressed in milliseconds.
* Will be overridden by config files.
*
*@type	{Number}
*@see	matchers.AbstractMatcher#test
*@see	SuiteLoader#initialize
*@name	matchers.AbstractMatcher.DEFAULT_TIMEOUT
*/
AbstractMatcher.DEFAULT_TIMEOUT = 0;

/** How long to wait between each try for a match.
* Until the match timeout expires, an element that did not match its expected value will be accessed on that interval.
* Expressed in milliseconds.
*
*@type	{Number}
*@name	matchers.AbstractMatcher.MATCH_TRY_DELAY
*/
AbstractMatcher.MATCH_TRY_DELAY = 100;


module.exports = AbstractMatcher;	// CommonJS export
