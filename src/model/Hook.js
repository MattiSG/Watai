var webdriver = require('selenium-webdriverjs'),
	promises = require('q');


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
	*@returns	{Promise}	A promise, resolved when keystrokes have been received, rejected in case of a failure.
	*@see	http://seleniumhq.org/docs/03_webdriver.html#sendKeys
	*@private
	*/
	this.handleInput = function handleInput(input) {
		var deferred = promises.defer(),
			reject = function() { deferred.reject() };	// it seems WebDriver's promises pass weird arguments that prevent the rejector from being used directly

		this.toSeleniumElement().then(function(elm) {
			elm.clear().then(function() {
				elm.sendKeys(input).then(deferred.resolve,
										 reject);
			}, reject);
		}, reject)

		return deferred.promise;
	}
}

/** Adds a getter and a setter to the given Object, allowing access to the Selenium element corresponding to the given hook description.
* The getter dynamically retrieves the Selenium element pointed at by the given selector description.
* The setter will pass the value to the `Hook.handleInput` method.
*
*@param	target			The Object to which the getter and setter will be added.
*@param	key				The name of the property to add to the target object.
*@param	typeAndSelector	A hook descriptor, as defined in the Hook constructor.
*@param	driver			The WebDriver instance in which the described elements are to be sought.
*
*@see	Hook
*@see	Hook#handleInput
*/
Hook.addHook = function addHook(target, key, typeAndSelector, driver) {
	var hook = new Hook(typeAndSelector, driver);

	target.__defineGetter__(key, function() {
		target.emit('access', key);
		return hook.toSeleniumElement(hook);
	});

	var inputHandler = function handleInputAndEmit(input) {
		target.emit('action', key, 'write', [ input ]);

		return hook.handleInput(input);
	}

	target.__defineSetter__(key, inputHandler);	// legacy support; works when setting inputs without any need to wait (for example, fails on animated elements)

	target['set' + key.capitalize()] = function(input) {	// wrapping to allow call-like syntax in scenarios
		return inputHandler.bind(null, input);	// use this setter when needing setters with timeouts
	}
}

module.exports = Hook;	// CommonJS export
