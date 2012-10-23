var promises = require('q');


var AbstractMatcher = new Class( /** @lends AbstractMatcher# */ {

	/** The widgets in which elements should be looked for.
	*@type	{Array.<Widget>}
	*@private
	*/
	widgets: null,

	/** The value this matcher should look for.
	*@protected
	*/
	expected: undefined,

	/** The type of content this matcher
	*/
	type: 'abstract',


	/**
	*@param	{Array.<Widget>}	The widgets in which elements should be looked for.
	*@param	{String}	selector	The element selector to look for in this instance's referenced widgets.
	*@param	expected	Any kind of content this matcher should look for.
	*@constructs
	*/
	initialize: function init(widgets, selector, expected) {
		this.widgets = widgets;
		this.expected = expected;
		this.selector = selector;

		this.compare = this.compare.bind(this);
		this.succeed = this.succeed.bind(this);
		this.fail = this.fail.bind(this);
	},

	/**
	*@returns	{Promise}	A promise that will be either resolved if their is a match, or rejected with the actual value passed.
	*/
	test: function test() {
		this.promise = promises.defer();

		Object.getFromPath(this.widgets, this.selector)
			  .then(this.onElementFound.bind(this),	// this wrapping is needed because the promise from `getFromPath` is a WebDriver promise, so we can't add failure handlers only, we need to set all handlers at once through the `then` method
			  		this.onElementMissing.bind(this));

		return this.promise.promise;
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
		if (actual === this.expected)
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
		this.promise.reject(this.formatError(actual));
	},

	formatError: function formatError(actualValue) {
		var result;

		if (typeof actualValue == 'undefined')
			result = 'Could not get "' + type + '" from element "' + this.selector + '"';
		else
			result = 'Element "' + this.selector + '" had ' + this.type + ' "' + actualValue + '" instead of "' + this.expected + '"';

		return result;
	}
});


module.exports = AbstractMatcher;	// CommonJS export
