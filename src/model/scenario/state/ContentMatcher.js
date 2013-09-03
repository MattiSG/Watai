/**@class	A matcher that tests its element's content, without prior knowledge of whether this content is to be obtained through inner text or element value.
*@extends	matchers.AbstractMatcher
*@memberOf	matchers
*/
var ContentMatcher = new Class( /** @lends matchers.ContentMatcher# */ {
	Extends: require('./AbstractMatcher'),

	type: 'content',

	onElementFound: function(element) {
		this.textPromise	= element.text();
		this.valuePromise	= element.getAttribute('value');

		this.textComparedPromise	= this.textPromise.then(this.compare, this.fail);
		this.valueComparedPromise	= this.valuePromise.then(this.compare, this.fail);
	},

	compare: function compare(actual) {
		if (this.match(actual, this.expected))
			return this.succeed();
		else if (this.valueComparedPromise.isRejected() || this.textComparedPromise.isRejected())
			return this.fail();
		else
			throw new Error('"' + actual + '"" does not match "' + expected + '"');	// reject the comparison promise
	},

	formatFailure: function formatFailure(failure) {
		var text	= this.textPromise.inspect().value,
			value	= this.valuePromise.inspect().value;

		return	'Found text "'
				+ text
				+ '" and '
				+ (value
					? 'value "' + value + '"'
					: 'no value')
				+ ' in '
				+ this.selector
				+ ', which does not match '
				+ (this.expected
					? '"' + this.expected + '"'
					: 'the empty string')
				+ '.';
	}
});

module.exports = ContentMatcher;	// CommonJS export
