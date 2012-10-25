/**@class	A matcher that tests for its element's existence in the DOM.
*@extends	matchers.AbstractMatcher
*@memberOf	matchers
*/
var ExistenceMatcher = new Class( /** @lends matchers.ExistenceMatcher# */ {
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
