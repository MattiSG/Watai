/**@class	A matcher that tests its element's textual content against a regular expression.
*@extends	matchers.AbstractMatcher
*@memberOf	matchers
*/
var RegExpTextMatcher = new Class( /** @lends matchers.RegExpTextMatcher# */ {
	Extends: require('./AbstractMatcher'),
	Implements: require('./pieces/TextExtractor'),

	type: 'text-regexp',

	/**
	*@param	{String}	actual
	*@param	{RegExp}	expected
	*/
	match: function match(actual, expected) {
		return expected.test(actual);
	},

	formatFailure: function formatFailure(actual) {
		return this.selector
				+ '’s textual content was "'
				+ actual
				+ '", which did not match the regular expression '
				+ this.expected
				+ '.';
	},

	/**
	*@see	AbstractStep#getDescription
	*/
	getDescription: function getDescription() {
		return 'Match of ' + this.selector + ' textual content against ' + this.expected;
	}
});

module.exports = RegExpTextMatcher;	// CommonJS export
