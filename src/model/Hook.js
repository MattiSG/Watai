var webdriver = require('nicolasdupont.selenium-webdriverjs');

var logger = require('winston').loggers.get('steps');


/**@class	A Hook allows one to target a specific element on a web page.
* It is a wrapper around both a selector and its type (css, xpath, id…).
*
*@param	hook	A single value-pair hash whose key may be one of `css`, `id`, or any other value of Selenium's `By` class; and whose value must be a string of the matching form.
*@param	driver	The WebDriver instance in which the described elements are to be sought.
*/
var Hook = function Hook(hook, driver) {
	this.type = Object.getOwnPropertyNames(hook)[0];
	this.selector = hook[this.type];

	this.driver = driver;

	/** Returns the element this hook points to in the given driver, as an object with all WebDriver methods.
	*
	*@see	http://seleniumhq.org/docs/03_webdriver.html
	*@private
	*/
	this.toSeleniumElement = function toSeleniumElement() {
		return this.driver.findElement(webdriver.By[this.type](this.selector));
	}

	/** Sends the given sequence of keystrokes to the element pointed by this hook.
	*
	*@param	input	A string that will be sent to this element.
	*@see	http://seleniumhq.org/docs/03_webdriver.html#sendKeys
	*@private
	*/
	this.handleInput = function handleInput(input) {
		var elm = this.toSeleniumElement();
		elm.clear();
		elm.sendKeys(input);
	}
}

/** Adds a getter and a setter to the given Object, allowing access to the Selenium element corresponding to the given hook description.
* The getter dynamically retrieves the Selenium element pointed at by the given selector description.
* The setter will pass the value to the `Hook.handleInput` method.
*
*@param	target	The Object to which the getter and setter will be added.
*@param	key	The name of the property to add to the target object.
*@param	typeAndSelector	A hook descriptor, as defined in the Hook constructor.
*@param	driver	The WebDriver instance in which the described elements are to be sought.
*
*@see	Hook
*@see	Hook#handleInput
*/
Hook.addHook = function addHook(target, key, typeAndSelector, driver) {
	var hook = new Hook(typeAndSelector, driver);
	target.__defineGetter__(key, function() {
		return hook.toSeleniumElement(hook);
	});
	target.__defineSetter__(key, function(input) {
		logger.info('	- set ' + target.name + '’s ' + key + ' to “' + input + '”');

		hook.handleInput(input);
	});
}

module.exports = Hook;	// CommonJS export
