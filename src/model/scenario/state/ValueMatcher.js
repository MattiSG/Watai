/**@class	A matcher that tests its element's `value` attribute.
*@extends	matchers.AbstractMatcher
*@memberOf	matchers
*/
var ValueMatcher = new Class( /** @lends matchers.ValueMatcher# */ {
	Extends: require('./AbstractMatcher'),
	Implements: require('./pieces/AttributeExtractor'),

	type: 'value'
});

module.exports = ValueMatcher;	// CommonJS export
