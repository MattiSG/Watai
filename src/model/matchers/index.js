/**@namespace	All public content matchers.
* 
* A _matcher_ is an object that handles state descriptors, i.e. each key/value pair in a state description object from a Feature’s scenario.
* You can access them through this hash.
*/
var matchers = {
	ExistenceMatcher:	require('./ExistenceMatcher'),
	TextMatcher:		require('./TextMatcher'),
	ValueMatcher:		require('./ValueMatcher'),
}

module.exports = matchers;
