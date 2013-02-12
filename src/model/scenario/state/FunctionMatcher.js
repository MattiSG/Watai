/**@class	A matcher that tests its element against a user-provided function.
*@extends	matchers.AbstractMatcher
*@memberOf	matchers
*/
var FunctionMatcher = new Class( /** @lends matchers.FunctionMatcher# */ {
	Extends: require('./AbstractMatcher'),

	type: 'function',

	onElementFound: function(element) {
		this.compare(element);
	},

	compare: function compare(element) {
		var evaluationResult = this.expected(element);

		if (! evaluationResult) {
			this.fail();
		} else if (typeof evaluationResult.then == 'function') {	// the user-provided function returned a promise
			evaluationResult.then(this.succeed, this.fail);
		} else {
			this.succeed();
		}
	},

	formatFailure: function formatFailure(actual) {
		return this.selector
				+ ' had its testing function fail, saying "' + actual + '":\n'
				+ this.expected;
	}
});

module.exports = FunctionMatcher;	// CommonJS export
