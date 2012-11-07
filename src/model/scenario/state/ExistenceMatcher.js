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
	},

	formatFailure: function formatFailure(actual) {
		if (actual) {
			return 'element '
					+ this.selector
					+ ' was in the DOM while it should not have.';
		} else {
			return 'element '
					+ this.selector
					+ ' was not in the DOM while it should have.';
		}
	}
});

module.exports = ExistenceMatcher;	// CommonJS export
