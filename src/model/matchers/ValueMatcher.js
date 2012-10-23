/**
*@class
*@extends	AbstractMatcher
*/
var ValueMatcher = new Class( /** @lends ValueMatcher# */ {
	Extends: require('./AbstractMatcher'),

	type: 'value',

	onElementFound: function(element) {
		element.getAttribute('value').then(this.compare, this.fail);
	}
});

module.exports = ValueMatcher;	// CommonJS export
