/**@class	A matcher that tests for its element's visibility in the DOM.
*@extends	matchers.AbstractMatcher
*@memberOf	matchers
*/
var VisibilityMatcher = new Class( /** @lends matchers.VisibilityMatcher# */ {
	Extends: require('./AbstractMatcher'),

	type: 'visibility',

	onElementFound: function(element) {
		element.isDisplayed()
				.done(this.compare,
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
	},

	toString: function toString() {
		return 'Visibility of ' + this.selector;
	}
});

module.exports = VisibilityMatcher;	// CommonJS export
