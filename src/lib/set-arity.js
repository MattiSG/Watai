/** Returns a string that looks like a function arguments list definition.
*
*@param	{Number}	count	How many arguments should be generated.
*@returns	{String}	An arguments declaration list usable in a Function constructor.
*@private
*/
function declareArguments(count) {
	return new Array(count).join('arg,') + 'arg';
}

/** Copies a closure and sets its `length` property.
* More details, the rationale and source for this helper can be found [on StackOverflow](http://stackoverflow.com/questions/13271474/override-the-arity-of-a-function).
*
*@param	{Function}	closure	The closure whose arity is to be set.
*@param	{Number}	arity	The arity to give to the closure.
*@returns	{Function}	A copy of the given closure, with the given arity.
*/
function giveArity(closure, arity) {
	return new Function(
		declareArguments(arity),	// arguments list
		'return this.apply(null, arguments);'	// actual call
	).bind(closure);
}


module.exports = giveArity;	// CommonJS export
