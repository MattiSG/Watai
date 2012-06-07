var webdriver = require('/Users/eurogiciel/Documents/Ghost/selenium/build/javascript/webdriver/webdriver');


/** A Hook allows one to target a specific element on a web page.
* It is a wrapper around both a selector and its type (css, xpath, id…).
*
*@param	hook	A single value-pair hash whose key may be one of `css`, `id`, or any other value of Selenium's `By` class; and whose value must be a string of the matching form.
*/
module.exports = function Hook(hook, driver) {
	this.type = Object.getOwnPropertyNames(hook)[0];
	this.selector = hook[this.type];
	
	this.driver = driver;
	
	/** Returns the element this hook points to in the given driver, as an object with all WebDriver methods.
	*
	*@see	http://seleniumhq.org/docs/03_webdriver.html
	*/
	this.toSeleniumElement = function toSeleniumElement() {
		return this.driver.findElement(webdriver.By[this.type](this.selector)); //TODO: cache?
	}
}
