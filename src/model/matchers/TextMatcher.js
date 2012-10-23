/**
*@class
*@extends	AbstractMatcher
*/
var TextMatcher = new Class( /** @lends TextMatcher# */ {
	Extends: require('./AbstractMatcher'),

	type: 'text',

	onElementFound: function(element) {
		element.getText().then(this.compare, this.fail);
	}
});

module.exports = TextMatcher;	// CommonJS export
