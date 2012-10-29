var promises = require('q');

var logger = require('winston').loggers.get('steps');

var Hook = require('./Hook');


var Widget = new Class( /** @lends Widget# */ {
	/** The name of this widget.
	* Automatically set to the name of its containing file upon parsing.
	*@type	{String}
	*/
	name: '',

	/**@class	Models a set of controls on a website.
	*
	*@constructs
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
			widget.addMagic(key);
		});

		delete values.elements;

		Object.each(values, function(method, key) {
			widget[key] = function() {
				logger.info('	- did ' + key + ' ' + Array.prototype.slice.call(arguments).join(', '));

				return method.apply(widget, arguments);	//TODO: handle elements overloading
			}
		});

		this.has = this.has.bind(this);
	},

	/** Add magic methods on specially-formatted elements.
	* _Example: "loginLink" makes the `loginLink` element available to the widget, but also generates the `login()` method, which automagically calls `click` on `loginLink`.
	*
	*@see	Widget.magic
	*@private
	*/
	addMagic: function addMagic(key) {
		var widget = this;

		Object.each(Widget.magic, function(matcher, method) {
			var matches = matcher.exec(key);
			if (matches) {	// `exec` returns `null` if no match was found
				var basename = matches[1];
				widget[basename] = function() {	// no immediate access to avoid calling the getter, which would trigger a Selenium access
					logger.info('	- ' + method + 'ed “' + basename + '”');

					return widget[key][method]();
				}
			}
		});
	},

	/** Checks that the given element is found on the page.
	*
	*@param	{String}	attribute	The name of the element whose presence is to be checked.
	*@returns	{Promise}	A promise that passes its `then`handler a `boolean`, whether the element was found or not.
	*/
	has: function has(attribute) {
		var deferred = promises.defer();

		this[attribute].then(function() {
				logger.info('	-', attribute, 'is present on the page');

				deferred.resolve(true);
			}, function() {
				logger.info('	-', attribute, 'is missing on the page');

				deferred.resolve(false);
			}
		);

		return deferred.promise;
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
