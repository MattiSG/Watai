/** A Widget models a set of controls on a website.
*/
var Widget = new Class({

	/**
	*@param	name	Name of this widget.
	*@param	values	A hash with the following form:
	*	`elements`: a hash mapping attribute names to a hook. A hook is a one-pair hash mapping a selector type to an actual selector.
	*	a series of methods definitions, i.e. `name: function name(…) { … }`, that will be made available
	*/
	initialize: function init(name, values) {
		this.name = name;
		
		Object.each(values.elements, function(hook, key) {
			this[key] = new Hook(hook);
		}, this);
		
		delete values.elements;
		
		Object.each(values, function(method, key) {
			this[key] = method.bind(this);
		}, this);
	}
});
