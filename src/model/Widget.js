var Hook = require('./Hook');


/**@class A Widget models a set of controls on a website.
*/
var Widget = new Class({
	/**
	*@param	name	Name of this widget.
	*@param	values	A hash with the following form:
	*	`elements`: a hash mapping attribute names to a hook. A hook is a one-pair hash mapping a selector type to an actual selector.
	*	a series of methods definitions, i.e. `name: function name(…) { … }`, that will be made available
	*@param	driver	The WebDriver instance in which this widget should look for its elements.
	*/
	initialize: function init(name, values, driver) {
		this.name = name;
		
		var widget = this;
		
		Object.each(values.elements, function(typeAndSelector, key) {
			Hook.addHook(widget, key, typeAndSelector, driver);
		});
		
		delete values.elements;
		
		Object.each(values, function(method, key) {
			widget[key] = function() {
				if (VERBOSE)
					console.log('	Widget "' + name + '" did ' + key);
				method.apply(widget, arguments); //TODO: handle elements overloading
			}
		});
	}
});

module.exports = Widget;	// CommonJS export
