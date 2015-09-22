/** All public content matchers.
* A _matcher_ is an object that handles state descriptors, i.e. each key/value pair in a state description object from a Scenario.
* You can access them through this hash.
*
*@namespace
*/
var matchers = {
	VisibilityMatcher	: require('./VisibilityMatcher'),
	ContentMatcher		: require('./ContentMatcher'),
	ContentRegExpMatcher: require('./ContentRegExpMatcher'),
	FunctionMatcher		: require('./FunctionMatcher')
}

/** Returns the matcher class that is able to test for the given expected value.
*
*@param	{*}	expected	Any value that matchers are to be found for.
*@returns	{AbstractMatcher|undefined}	A *class*, to be initialized, or nothing if no matcher can be used for the given value.
*/
matchers.forValue = function matcherForValue(expected) {
	if (typeof expected == 'boolean') {	// TODO: make matchers responsible for defining which value types they can handle instead of this horrendous switch
		return matchers.VisibilityMatcher;
	} else if (typeof expected == 'function') {
		return matchers.FunctionMatcher;
	} else if (expected.constructor && expected.constructor.name === 'RegExp') {	// since elements are loaded in a separate context, the `instanceof` fails, as it compares constructors references
		return matchers.ContentRegExpMatcher;
	} else if (typeof expected == 'string') {
		return matchers.ContentMatcher;
	}
}

module.exports = matchers;
