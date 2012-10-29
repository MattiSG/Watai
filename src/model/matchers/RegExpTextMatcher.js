/**@class	A matcher that tests its element's textual content against a regular expression.
*@extends	matchers.AbstractMatcher
*@memberOf	matchers
*/
var TextMatcher = new Class( /** @lends matchers.RegExpTextMatcher# */ {
	Extends: require('./AbstractMatcher'),

	type: 'regexp',

	onElementFound: function(element) {
		element.getText().then(function(text) {
				if (this.expected.test(text))
					this.succeed();
				else
					this.fail(text);
			}.bind(this),
			this.fail
		);
	}
});

module.exports = TextMatcher;	// CommonJS export
