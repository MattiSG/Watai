/**@class	A matcher that tests for its element's existence in the DOM.
*@extends	matchers.AbstractMatcher
*@memberOf	matchers
*/
var VisibilityMatcher = new Class( /** @lends matchers.VisibilityMatcher# */ {
	Extends: require('./AbstractMatcher'),

	type: 'existence',

	onElementFound: function(element) {
		element.isDisplayed()
				.then(this.compare,
					  this.fail);
	},

	onElementMissing: function() {
		this.compare(false);
	},

	formatFailure: function formatFailure(actual) {
		if (actual) {
			return 'element '
					+ this.selector
					+ ' was visible on the page while it should not have.';
		} else {
			return 'element '
					+ this.selector
					+ ' was not visible on the page while it should have.';
		}
	}
});

module.exports = VisibilityMatcher;	// CommonJS export
