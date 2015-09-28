var promises =	require('q');


/**@class	Abstract class from which all content matchers inherit.
*
* A _matcher_ is an object that handles state descriptors, i.e. each key/value pair in a state description object from a Scenario.
* Implementing a new matcher, i.e. offering a new content comparison type, is very easy: simply extend this class, taking example on the existing concrete matchers, and redefine at least `onElementFound`, calling `this.succeed`, `this.fail` and/or `this.compare`.
*
*@extends	steps.AbstractStep
*@memberOf	matchers
*/
var AbstractMatcher = new Class( /** @lends matchers.AbstractMatcher# */ {

	Extends: require('../AbstractStep'),

	/** The type of content this matcher can match an element on.
	*/
	type: 'abstract matcher',

	/** The value this matcher should look for.
	*/
	expected: undefined,

	/** The components in which elements should be looked for.
	*@type	{Object.<String,Component>}
	*@private
	*/
	components: [],

	/** A component element selector, describing the element whose content is to be matched.
	*@type	{String}
	*@private
	*/
	selector: '',


	/** Creates a matcher, ready to be evaluated.
	*
	*@param	{*}	expected	Any kind of content this matcher should look for.
	*@param	{String}	selector	The element selector to look for in this instance's referenced components.
	*@param	{Object.<String,Component>}	[components]	The components in which elements should be looked for.
	*@constructs
	*@see	test
	*@see	addComponents
	*/
	initialize: function init(expected, selector, components) {
		this.addComponents(components);
		this.selector = selector;
		this.expected = expected;

		this.compare = this.compare.bind(this);
		this.succeed = this.succeed.bind(this);
		this.fail = this.fail.bind(this);
	},

	/** Adds the given components to the ones that are available to this matcher to seek elements in.
	*
	*@param	{Object.<String,Component>}	components	The components in which elements should be looked for.
	*@returns	this	For chaining.
	*/
	addComponents: function addComponents(components) {
		Object.append(this.components, components);
		return this;
	},

	/** Starts an actual match, by trying to obtain the element pointed by this instance's selector.
	*
	*@private
	*/
	start: function start() {
		Object.getFromPath(this.components, this.selector)
			  .done(this.onElementFound.bind(this),	// this wrapping is needed because the promise from `getFromPath` is a WebDriver promise, so we can't add failure handlers only, we need to set all handlers at once through the `then` method
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
	*@param	{Error}	error	The error raised by WebDriver.
	*/
	onElementMissing: function onElementMissing(error) {
		this.fail(error);
	},

	/** Compares the given value to the expected value, using the `match` method, and fails or succeeds the match automatically.
	*
	*@param	{*}	actual	The value that should be compared against this instance's expected value.
	*@see	match
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
	*@param	{*}	actual	The value that should be compared against the expected value.
	*@param	{*}	expected	The value to compare against.
	*/
	match: function match(actual, expected) {
		return actual == expected;
	},

	/** Formats the message displayed to the user in case of a failure.
	* May be redefined by children classes.
	* May be prefixed by timeout information when actually shown to the user.
	*
	*@param	{*}	actual	The actual value that was encountered.
	*/
	formatFailure: function formatFailure(actual) {
		if (typeof actual == 'undefined') {
			return 'could not determine the '
					+ this.type
					+ ' from element '
					+ this.selector
					+ '.';
		}

		return this.selector
				+ "'s "
				+ this.type
				+ ' was'
				+ (this.timeout > 0 ? ' still "' : ' "')
				+ actual
				+ '" instead of "'
				+ this.expected
				+ '".';
	},

	toString: function toString() {
		return	'Match '
				+ this.selector + '’s '
				+ (this.attribute || this.type)
				+ ' against "'
				+ this.expected
				+ '"';
	},

	/** Formats a "NoSuchElement" JsonWire error.
	*
	*@param		{JsonWireError}	error	The error to format.
	*@returns	{String}	The formatted error.
	*/
	formatJsonWireError7: function formatJsonWireError7(error) {
		return this.selector + ' was not found.'
	}
});


module.exports = AbstractMatcher;	// CommonJS export
