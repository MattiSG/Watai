/**@class	A matcher that tests its element's textual content.
*@extends	matchers.AbstractMatcher
*@memberOf	matchers
*/
var TextMatcher = new Class( /** @lends matchers.TextMatcher# */ {
	Extends: require('./AbstractMatcher'),

	type: 'text',

	onElementFound: function(element) {
		element.getText().then(this.compare, this.fail);
	}
});

module.exports = TextMatcher;	// CommonJS export
