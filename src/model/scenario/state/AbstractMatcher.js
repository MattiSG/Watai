var promises =	require('q'),
	config =	require('../../../lib/configManager');


/**@class	Abstract class from which all content matchers inherit.
*
* A _matcher_ is an object that handles state descriptors, i.e. each key/value pair in a state description object from a Feature’s scenario.
* Implementing a new matcher, i.e. offering a new content comparison type, is very easy: simply extend this class, taking example on the existing concrete matchers, and redefine at least `onElementFound`, calling `this.succeed`, `this.fail` and/or `this.compare`.
*
*@memberOf	matchers
*/
var AbstractMatcher = new Class( /** @lends matchers.AbstractMatcher# */ {

	Extends: require('../AbstractStep'),

	/** The type of content this matcher can match an element on.
	*/
	type: 'abstract',

	/** The value this matcher should look for.
	*/
	expected: undefined,

	/** The widgets in which elements should be looked for.
	*@type	{Object.<String,Widget>}
	*@private
	*/
	widgets: [],

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


	/** Creates a matcher, ready to be evaluated.
	*
	*@param	expected	Any kind of content this matcher should look for.
	*@param	{String}	selector	The element selector to look for in this instance's referenced widgets.
	*@param	{Array.<Widget>}	[widgets]	The widgets in which elements should be looked for.
	*@constructs
	*@see	#test
	*@see	#addWidgets
	*/
	initialize: function init(expected, selector, widgets) {
		this.addWidgets(widgets);
		this.selector = selector;
		this.expected = expected;

		this.compare = this.compare.bind(this);
		this.succeed = this.succeed.bind(this);
		this.fail = this.fail.bind(this);
	},

	/** Adds the given widgets to the ones that are available to this matcher to seek elements in.
	*
	*@param	{Object.<String,Widget>}	widgets	The widgets in which elements should be looked for.
	*@returns	this	For chaining.
	*/
	addWidgets: function addWidgets(widgets) {
		Object.append(this.widgets, widgets);
		return this;
	},

	/** Initializes the original value this matcher will encounter.
	*
	*@private
	*/
	onBeforeStart: function onBeforeStart() {
		this.original = undefined;
	},

	/** Stores the actually encountered value, to detect bad changes.
	*
	*@param	actual	The actual content that was found by this matcher.
	*@private
	*/
	onFailure: function onFailure(actual) {
		if (typeof this.original == 'undefined')
			this.original = actual;	// this is used to wait for a _change_ in the element value rather than for a match
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

	/** Compares the given value to the expected value, using the `match` method, and fails or succeeds the match automatically.
	*
	*@param	actual	The value that should be compared against this instance's expected value.
	*@see	#match
	*/
	compare: function compare(actual) {
		if (this.match(actual, this.expected))
			this.succeed();
		else
			this.fail(actual);
	},

	/** Compares the equality of the two given values.
	* To be modified by inheriting classes. Defaults to testing loose equality with `==`.
	*
	*@param	actual	The value that should be compared against the expected value.
	*@param	expected	The value to compare against.
	*/
	match: function match(actual, expected) {
		return actual == expected;
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


module.exports = AbstractMatcher;	// CommonJS export
