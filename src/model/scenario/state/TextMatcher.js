/**@class	A matcher that tests its element's textual content.
*@extends	matchers.AbstractMatcher
*@memberOf	matchers
*/
var TextMatcher = new Class( /** @lends matchers.TextMatcher# */ {
	Extends: require('./AbstractMatcher'),
	Implements: require('./pieces/TextExtractor'),

	type: 'text'
});

module.exports = TextMatcher;	// CommonJS export
