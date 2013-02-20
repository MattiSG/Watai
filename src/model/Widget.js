var promises = require('q');

var Hook = require('./Hook');


var Widget = new Class( /** @lends Widget# */ {

	Extends: require('events').EventEmitter,

	/** The name of this widget.
	* Automatically set to the name of its containing file upon parsing.
	*@type	{String}
	*@private
	*/
	name: '',

	/**@class	Models a set of controls on a website.
	*
	*@constructs
	*@param	name	User-visible name of this widget.
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
			widget.addMagic(key);
		});

		delete values.elements;	// this key is magic, we don't want to iterate over it, as other keys are user-defined actions

		Object.each(values, function(method, key) {
			widget[key] = function() {
				var args = Array.prototype.slice.call(arguments);	// make an array of prepared arguments

				return function() {
					widget.emit('action', key, method, args);
					return method.apply(widget, args);
				}
			}
		});
	},

	/** Add magic methods on specially-formatted elements.
	* _Example: "loginLink" makes the `loginLink` element available to the widget, but also generates the `login()` method, which automagically calls `click` on `loginLink`.
	*
	*@param	{String}	key	The key that should be considered for adding magic elements.
	*@see	Widget.magic
	*@private
	*/
	addMagic: function addMagic(key) {
		var widget = this;

		Object.each(Widget.magic, function(matcher, method) {
			var matches = matcher.exec(key);

			if (! matches)	// no match, hence no magic to add
				return;

			var basename = matches[1],
				type = matches[2];	// for example "Link", "Button"…

			widget[basename] = function() {	// wrapping to allow immediate calls in scenario steps	//TODO: rather return an object with methods, and leave preparation for scenarios to the Widget constructor
				var args = Array.prototype.slice.call(arguments);	// make an array of prepared arguments

				return function() {	// no immediate access to avoid calling the getter, which would trigger a Selenium access
					widget.emit('action', key, method, args);
					return widget[key][method].apply(widget[key], args);
				}
			}
		});
	}
});

/** Maps magic element regexps from the action that should be generated.
* _Example: "loginLink" makes the `loginLink` element available to the widget, but also generates the `login()` method, which automagically calls `click` on `loginLink`._
*
* Keys are names of the methods that should be added to the element, and values are regexps that trigger the magic.
* The name of the generated member is the content of the first capturing parentheses match in the regexp.
*
*@see	RegExp#exec
*@private
*/
Widget.magic = {
	click:	/(.+)(Link|Button|Checkbox)$/i
}

module.exports = Widget;	// CommonJS export
