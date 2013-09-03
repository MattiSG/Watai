/**@class	A matcher that tests its element's content against a regular expression, without prior knowledge of whether this content is to be obtained through inner text or element value.
*@extends	matchers.ContentMatcher
*@memberOf	matchers
*/
var ContentRegExpMatcher = new Class( /** @lends matchers.ContentRegExpMatcher# */ {
	Extends: require('./ContentMatcher'),

	match: function match(actual, expected) {
		return expected.exec(actual);
	}
});

module.exports = ContentRegExpMatcher;	// CommonJS export
