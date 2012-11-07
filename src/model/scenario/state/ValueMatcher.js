/**@class	A matcher that tests its element's `value` attribute.
*@extends	matchers.AbstractMatcher
*@memberOf	matchers
*/
var ValueMatcher = new Class( /** @lends matchers.ValueMatcher# */ {
	Extends: require('./AbstractMatcher'),

	type: 'value',

	onElementFound: function(element) {
		element.getAttribute('value').then(this.compare, this.fail);
	}
});

module.exports = ValueMatcher;	// CommonJS export
