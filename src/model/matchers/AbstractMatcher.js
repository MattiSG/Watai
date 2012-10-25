var promises = require('q');


var AbstractMatcher = new Class( /** @lends AbstractMatcher# */ {

	/** The type of content this matcher can match an element on.
	*/
	type: 'abstract',

	/** Time, in milliseconds, until not having a match is considered a failure.
	*@type	{Number}
	*/
	timeout: 0,

	/** The value this matcher should look for.
	*@protected
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

	/** Starts the actual evaluation process.
	*
	*@param	{Number}	[timeout]	optional, specifies a timeout, in milliseconds, for this matcher to consider the lack of a match as a failure. Defaults to DEFAULT_TIMEOUT. Set to 0 to disable timeout altogether and give no chance to the pointed element to change asynchronously.
	*@returns	{Promise}	A promise that will be either resolved if their is a match, or rejected with the actual value passed.
	*@see	AbstractMatcher.DEFAULT_TIMEOUT
	*/
	test: function test(timeout) {
		this.promise = promises.defer();
		this.original = undefined;
		this.startTime = new Date();
		this.timeout = (typeof timeout == 'number' ? timeout : AbstractMatcher.DEFAULT_TIMEOUT);

		this.start();

		return this.promise.promise;
	},

	start: function start() {
		Object.getFromPath(this.widgets, this.selector)
			  .then(this.onElementFound.bind(this),	// this wrapping is needed because the promise from `getFromPath` is a WebDriver promise, so we can't add failure handlers only, we need to set all handlers at once through the `then` method
			  		this.onElementMissing.bind(this));
	},

	onElementFound: function onElementFound(element) {
		throw new Error('AbstractMatcher should never be used as an instance! onElementFound() has to be redefined.');
	},

	/** Handler for missing element. May be redefined.
	* Defaults to failing.
	*
	*@protected
	*/
	onElementMissing: function onElementMissing(error) {
		this.fail('Element "' + this.selector + '" does not exist on the page.')
	},

	/** Compares the given value to the expected value, and fails or succeeds the match automatically.
	*
	*@protected
	*/
	compare: function compare(actual) {
		if (actual == this.expected)
			this.succeed();
		else
			this.fail(actual);
	},

	/** Marks the match as successful.
	*
	*@protected
	*/
	succeed: function succeed() {
		this.promise.resolve();
	},

	/** Marks the match as failed.
	*
	*@param	actual	The actual content that was found by this matcher.
	*@protected
	*/
	fail: function fail(actual) {
		var failureMessage;

		if (typeof this.original == 'undefined')
			this.original = actual;	// this is used to wait for a _change_ in the element value rather than for a match
	
		if (new Date() - this.startTime >= this.timeout)	// the timeout has expired
			this.failImmediately(actual);
		else
			this.start.delay(AbstractMatcher.MATCH_TRY_DELAY, this);
	},

	failImmediately: function failImmediately(actual) {
		var failureMessage = (this.timeout > 0 ? 'After ' + this.timeout + ' milliseconds, ' : '');

		if (typeof actual == 'undefined') {
			failureMessage += 'could not determine the '
							+ this.type
							+ ' from element '
							+ this.selector
							+ '.';
		} else if (actual != this.original) {
			failureMessage += this.selector
							+ ' changed its value to "'
							+ actual
							+ '" rather than to "'
							+ this.expected
							+ '".';
		} else {
			failureMessage += this.selector
							+ "'s "
							+ this.type
							+ ' was'
							+ (this.timeout > 0 ? ' still "' : ' "')
							+ actual
							+ '" instead of "'
							+ this.expected
							+ '".';
		}

		this.promise.reject(failureMessage);
	}
});


/** How long to wait until the lack of a match is considered as a failure, unless more precision is given at the time of testing.
* Expressed in milliseconds.
* Will be overridden by config files.
*
*@type	{Number}
*@see	AbstractMatcher#test
*@see	SuiteLoader#initialize
*/
AbstractMatcher.DEFAULT_TIMEOUT = 0;

/** How long to wait between each try for a match.
* Until the match timeout expires, an element that did not match its expected value will be accessed on that interval.
* Expressed in milliseconds.
*
*@type	{Number}
*/
AbstractMatcher.MATCH_TRY_DELAY = 100;


module.exports = AbstractMatcher;	// CommonJS export
