/** Wraps a function and injects some code right before it is executed, while still advertising the wrapped function's original arity.
* More details, the rationale and source for this helper can be found [on StackOverflow](http://stackoverflow.com/questions/13271474/override-the-arity-of-a-function).
*
*Example:
* wrap(
*	'this.say("hello");',	// the code to be injected before executing the wrapped method
*	{ say: console.log }	// definition of `this.say` above. No-"this" prefixed variables are not possible.
*	myMethod,				// the method you want to wrap
*	myObject				// the object on which `myMethod` is to be called
* )
*
*
*@param	{String}	preflight	Some code, in a string (eew…), to be added before calling the wrapped method.
*@param	{Object}	context		Variables to give access to in the `preflight` code. **They will be accessible through `this`.**
*@param	{Function}	method		The function to wrap.
*@param	{Object}	[target]	If specified, the object on which the given method will be called.
*@returns	{Function}	A function, ready to be executed, that will execute the `preflight` code and then `target.method()`.
*/
module.exports = function wrap(preflight, context, method, target) {
	context = context || {};

	// we can't access local variables throught the usual closure magic when creating a function through the Function constructor, so we'll embed all the needed data in one object
	context.__method = method;
	context.__target = target;

	var result = new Function(new Array(method.length).join('arg,') + 'arg',
		preflight
		+ ';'
		+ 'return this.__method.apply(this.__target, arguments);'
	);

	// and bind `this` to refer to `context` within the function
	return result.bind(context);
}
