var hasOwnProperty = Object.prototype.hasOwnProperty;

Object.extend( /* @lends Object */ {
	/** Tells whether the given property path (a string delimiting nested properties with a dot) is available, without accessing the last property.
	*@param	source	{Object}	The object in which the given property path should be looked up.
	*@param	parts	{String}	A path of properties to walk, delimited by dots.
	*@returns	{Boolean}
	*@memberOf	Object
	*/
	hasPropertyPath: function hasPropertyPath(source, parts) {
		if (typeof parts == 'string')
			parts = parts.split('.');

		for (var i = 0, l = parts.length; i < l - 1; i++) {
			if (hasOwnProperty.call(source, parts[i]))
				source = source[parts[i]];
			else
				return false;
		}

		return hasOwnProperty.call(source, parts[i]);
	},

	/** Tells whether the given property path (a string delimiting nested properties with a dot) points at a getter.
	*@param	source	{Object}	The object in which the given getter path should be looked up.
	*@param	parts	{String}	A path of properties to walk, delimited by dots.
	*@returns	{Boolean}
	*@memberOf	Object
	*/
	hasGetter: function hasGetter(source, parts) {
		if (typeof parts == 'string')
			parts = parts.split('.');

		for (var i = 0, l = parts.length; i < l - 1; i++) {
			if (hasOwnProperty.call(source, parts[i]))
				source = source[parts[i]];
			else
				return false;
		}

		return Object.prototype.__lookupGetter__.call(source, parts[i]);
	},

	/** Returns the property at the end of the given property path (a string delimiting nested properties with a dot).
	* Part of MooTools-more.
	*
	*@param	source	{Object}	The object in which the given property path should be looked up.
	*@param	parts	{String}	A path of properties to walk, delimited by dots.
	*@returns	The pointed property, or `null` if any of the sub-paths is incorrect.
	*@memberOf	Object
	*/
	getFromPath: function getFromPath(source, parts) {
		if (typeof parts == 'string')
			parts = parts.split('.');

		for (var i = 0, l = parts.length; i < l; i++) {
			if (hasOwnProperty.call(source, parts[i]))
				source = source[parts[i]];
			else
				return null;
		}

		return source;
	}
});

String.implement( /* @lends String */ {

	/** A naive approach to pluralization: postfixes this string with an 's' if needed, and prefixes it with the given amount.
	*
	*@param {Number}	count		The count of items represented by this string.
	*@param	{String}	[postfix]	The String to append in plural form. Defaults to 's'.
	*@returns {String} string	This string, pluralized based on the count.
	*/
	count: function count(count, postfix) {
		return count + ' ' + this + (count == 1 ? '' : postfix || 's');
	}
});
