/** A selection of helper functions that are not worth including as a full-fledged separate library.
*/

var hasOwnProperty = Object.prototype.hasOwnProperty;

// part of MooTools-more
Object.extend({

	getFromPath: function(source, parts){
		if (typeof parts == 'string') parts = parts.split('.');
		for (var i = 0, l = parts.length; i < l; i++){
			if (hasOwnProperty.call(source, parts[i])) source = source[parts[i]];
			else return null;
		}
		return source;
	}
});
