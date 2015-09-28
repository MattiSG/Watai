var promises = require('q');


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
		promises.fcall(this.expected, element)
				.done(this.succeed, this.fail);
	},

	formatFailure: function formatFailure(actual) {
		return this.selector
				+ ' had its testing function fail, saying "' + actual + '":\n'
				+ this.expected;
	},

	toString: function toString() {
		return 'Evaluation of ' + (this.expected.name || 'an unnamed function') + ' on ' + this.selector;
	}
});

module.exports = FunctionMatcher;	// CommonJS export
