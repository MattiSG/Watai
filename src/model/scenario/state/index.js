/**@namespace	All public content matchers.
*
* A _matcher_ is an object that handles state descriptors, i.e. each key/value pair in a state description object from a Feature’s scenario.
* You can access them through this hash.
*/
var matchers = {
	ExistenceMatcher:	require('./ExistenceMatcher'),
	TextMatcher:		require('./TextMatcher'),
	ValueMatcher:		require('./ValueMatcher'),
	RegExpTextMatcher:	require('./RegExpTextMatcher')
}

/** Returns an array of all matcher classes that are able to test for the given expected value.
*
*@param	expected	Any value that matchers are to be found for.
*@returns	{Array.<AbstractMatcher>}	An array of *classes*, to be initialized.
*/
matchers.allFor = function allMatchersFor(expected) {
	var result = [];

	if (typeof expected == 'boolean') {	// TODO: make matchers responsible for defining which value types they can handle instead of this horrendous switch
		result.push(matchers.ExistenceMatcher);
	} else if (expected.constructor && expected.constructor.name === 'RegExp') {	// since elements are loaded in a separate context, the `instanceof` fails, as it compares constructors references
		result.push(matchers.RegExpTextMatcher);
	} else {
		result.push(matchers.TextMatcher);
		result.push(matchers.ValueMatcher);
	}

	return result;
}

module.exports = matchers;
