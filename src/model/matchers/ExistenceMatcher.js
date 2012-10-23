/**
*@class
*@extends	AbstractMatcher
*/
var ExistenceMatcher = new Class( /** @lends ExistenceMatcher# */ {
	Extends: require('./AbstractMatcher'),

	type: 'existence',

	onElementFound: function(element) {
		this.compare(true);
	},

	onElementMissing: function() {
		this.compare(false);
	}
});

module.exports = ExistenceMatcher;	// CommonJS export
