var hasOwnProperty = Object.prototype.hasOwnProperty;

/**@namespace	A selection of helper functions that are not worth including as a full-fledged separate library.
*/
Object.extend({
	/** Tells whether the given property path (a string delimiting nested properties with a dot) is available, without accessing the last property.
	*@param	source	{Object}	The object in which the given property path should be looked up.
	*@param	parts	{String}	A path of properties to walk, delimited by dots.
	*@returns	{Boolean}
	*/
	hasPropertyPath: function(source, parts) {
		if (typeof parts == 'string') parts = parts.split('.');
		for (var i = 0, l = parts.length; i < l - 1; i++) {
			if (hasOwnProperty.call(source, parts[i]))
				source = source[parts[i]];
			else
				return false;
		}
		
		return hasOwnProperty.call(source, parts[i]);
	},

	/** Returns the property at the end of the given property path (a string delimiting nested properties with a dot).
	* Part of MooTools-more.
	*
	*@param	source	{Object}	The object in which the given property path should be looked up.
	*@param	parts	{String}	A path of properties to walk, delimited by dots.
	*@returns	The pointed property, or `null` if any of the sub-paths is incorrect.
	*/
	getFromPath: function(source, parts) {
		if (typeof parts == 'string') parts = parts.split('.');
		for (var i = 0, l = parts.length; i < l; i++) {
			if (hasOwnProperty.call(source, parts[i]))
				source = source[parts[i]];
			else
				return null;
		}
		
		return source;
	}
});
