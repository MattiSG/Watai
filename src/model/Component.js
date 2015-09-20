var promises = require('q');

var Locator = require('./Locator');


var Component = new Class( /** @lends Component# */ {

	Extends: require('events').EventEmitter,

	/** The name of this component.
	* Automatically set to the name of its containing file upon parsing.
	*@type	{String}
	*@private
	*/
	name: '',

	/**@class	Models a set of controls on a website.
	*
	*@constructs
	*@param	{String}	name	User-visible name of this component.
	*@param	{Hash}		values	A hash describing a component's elements and actions. Keys will be made available directly on the resulting test component, and associated values can be locators for elements or functions for actions.
	*@param	{WebDriver}	driver	The WebDriver instance in which this component should look for its elements.
	*/
	initialize: function init(name, values, driver) {
		this.name = name;

		var component			= this,
			elementsAndActions	= this.extractElementsAndActions(values);

		Object.each(elementsAndActions.elements, function(typeAndSelector, key) {
			Locator.addLocator(component, key, typeAndSelector, driver);
			component.addMagic(key);
		});

		Object.each(elementsAndActions.actions, function(method, key) {
			component[key] = function() {
				var args = Array.prototype.slice.call(arguments);	// make an array of prepared arguments

				// in order to present a meaningful test report, we need to have actions provide as much description elements as possible
				// in user-provided functions, the function's name takes this place
				// however, when wrapping these names, we can't assign to a Function's name, and dynamically creating its name means creating it through evaluation, which means we'd first have to extract its arguments' names, which is getting very complicated
				var action = function() {
					return method.apply(component, args);
				}

				action.component = component;
				action.reference = key;
				action.title = method.name;
				action.args = args;

				return action;
			}
		});
	},

	/** Extract elements and actions from the given parameter
	*
	*@param	{Hash} values	A hash describing a component's elements and actions. Keys will be made available directly on the resulting test component, and associated values can be locators for elements or functions for actions.
	*@return {Hash} A hash containing the following keys:
	*	- `elements`: A hash mapping all locator names to their description.
	*	- `actions`: A hash mapping all method names to the actual function.
	*@see Locator
	*@private
	*/
	extractElementsAndActions: function extractElementsAndActions(values) {
		var result = {
			elements: {},
			actions: {}
		};

		Object.each(values, function(value, key) {
			if (typeof value != 'function')
				result.elements[key] = value;
			else
				result.actions[key] = value;
		});

		return result;
	},

	/** Add magic actions on specially-formatted elements.
	*@example addMagic("loginLink")	// makes the `loginLink` element available to the component, but also generates the `login()` method, which automagically calls `click` on `loginLink`
	*
	*@param	{String}	key	The key that should be considered for adding magic elements.
	*@see	Component.magic
	*@private
	*/
	addMagic: function addMagic(key) {
		var component = this;

		Object.each(Component.magic, function(matcher, method) {
			var matches = matcher.exec(key);

			if (! matches)	// no match, hence no magic to add
				return;

			var basename = matches[1],
				type = matches[2];	// for example "Link", "Button"…

			component[basename] = function() {	// wrapping to allow immediate calls in scenario steps	// TODO: rather return an object with methods, and leave preparation for scenarios to the Component constructor
				var args = Array.prototype.slice.call(arguments);	// make an array of prepared arguments

				var action = function() {	// no immediate access to avoid calling the getter, which would trigger a Selenium access
					return component[key].then(function(element) {
						return element[method].apply(element, args);
					});
				}

				action.component = component;
				action.reference = basename;
				action.title = basename;
				action.args = args;

				return action;
			}
		});
	},

	/** Returns the user-provided name of this component.
	*
	*@returns	{String}
	*@see		name
	*/
	toString: function toString() {
		return this.name;
	}
});

/** Maps magic element regexps from the action that should be generated.
* _Example: "loginLink" makes the `loginLink` element available to the component, but also generates the `login()` method, which automagically calls `click` on `loginLink`._
*
* Keys are names of the actions that should be added to the element, and values are regexps that trigger the magic.
* The name of the generated member is the content of the first capturing parentheses match in the regexp.
*
*@see	RegExp#exec
*@private
*/
Component.magic = {
	click:	/(.+)(Link|Button|Checkbox|Option|Radio)$/i
}

module.exports = Component;	// CommonJS export
