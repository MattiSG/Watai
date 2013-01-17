/**@class	A matcher that tests its element's value attribute against a regular expression.
*@extends	matchers.AbstractMatcher
*@memberOf	matchers
*/
var RegExpValueMatcher = new Class( /** @lends matchers.RegExpValueMatcher# */ {
	Extends: require('./AbstractMatcher'),
	Implements: require('./pieces/AttributeExtractor'),

	attribute: 'value',

	type: 'value-regexp',

	/**
	*@param	{String}	actual
	*@param	{RegExp}	expected
	*/
	match: function match(actual, expected) {
		return expected.test(actual);
	},

	formatFailure: function formatFailure(actual) {
		return this.selector
				+ '’s value was "'
				+ actual
				+ '", which did not match the regular expression '
				+ this.expected
				+ '.';
	}
});

module.exports = RegExpValueMatcher;	// CommonJS export
