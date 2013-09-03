/**@namespace	All public content matchers.
*
* A _matcher_ is an object that handles state descriptors, i.e. each key/value pair in a state description object from a Feature’s scenario.
* You can access them through this hash.
*/
var matchers = {
	VisibilityMatcher	: require('./VisibilityMatcher'),
	ContentMatcher		: require('./ContentMatcher'),
	ContentRegExpMatcher: require('./ContentRegExpMatcher'),
	FunctionMatcher		: require('./FunctionMatcher')
}

/** Returns an array of all matcher classes that are able to test for the given expected value.
*
*@param	expected	Any value that matchers are to be found for.
*@returns	{Array.<AbstractMatcher>}	An array of *classes*, to be initialized.
*/
matchers.allFor = function allMatchersFor(expected) {
	var result = [];

	if (typeof expected == 'boolean') {	// TODO: make matchers responsible for defining which value types they can handle instead of this horrendous switch
		result.push(matchers.VisibilityMatcher);
	} else if (typeof expected == 'function') {
		result.push(matchers.FunctionMatcher);
	} else if (expected.constructor && expected.constructor.name === 'RegExp') {	// since elements are loaded in a separate context, the `instanceof` fails, as it compares constructors references
		result.push(matchers.ContentRegExpMatcher);
	} else {
		result.push(matchers.ContentMatcher);
	}

	return result;
}

module.exports = matchers;
