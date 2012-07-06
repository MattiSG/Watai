var webdriver = require('selenium-webdriverjs');
var growl;
try {
	growl = require('growl');
} catch (e) {
	growl = false;
}
	
var logger = require('winston').loggers.get('suites');


/**@class Manages a set of features and the driver in which they are run.
*
* A `Runner` is mostly set up through a configuration object.
* Such an object should contain the following items:
*	- `baseURL`: the URL at which the driver should start;
*	- `driverCapabilities`: an object that will be passed straight to the WebDriver instance.
*
* The chosen implementation for WebDriver is the [official WebDriverJS](https://code.google.com/p/selenium/wiki/WebDriverJs) by the Selenium team. Make sure you use this module and not one of the other implementations, since this code has not been tested with any other.
*/
var Runner = new Class({
	/** Whether any test did fail during the current run or not.
	*@type	{boolean}
	*@private
	*/
	failed: false,
	
	/** The list of all features to evaluate with this configuration.
	*@type	{Array.<Feature>}
	*@private
	*/
	features: [],
	
	/** Index of the currently evaluated feature.
	*@type	{integer}
	*@private
	*/
	currentFeature: 0,

	/** A runner is set up by passing it a configuration object.
	*
	*@param	{Object}	config	A configuration object, as defined above.
	*
	*@see	WebDriver.Builder#withCapabilities
	*/
	initialize: function init(config) {
		this.config = config;
		
		this.driver = new webdriver.Builder()
						.usingServer('http://127.0.0.1:4444/wd/hub')	//TODO: extract connect URL and put it in config
						.withCapabilities(config.driverCapabilities)
						.build();
						
		DRIVER = this.driver;
	},
	
	/** Adds the given Feature to the list of those that this Runner will evaluate.
	*
	*@param	{Feature}	feature	A Feature for this Runner to evaluate.
	*@returns	This Runner, for chaining.
	*/
	addFeature: function addFeature(feature) {
		this.features.push(feature);
		
		return this;
	},
	
	/** Returns the WebDriver instance this Runner created for the current run.
	*
	*@returns	WebDriver
	*/
	getDriver: function getDriver() {
		return this.driver;
	},
	
	/** Starts evaluation of all features added to this Runner.
	*
	*@returns	{Runner}	This Runner, for chainability.
	*/
	//TODO: should return a promise for results
	run: function run() {
		this.failed = false;
		this.currentFeature = 0;

		var runner = this;
		this.driver.get(this.config.baseURL).then(function() {
			runner.evaluateFeature(runner.features[0]);
		});
		
		return this;
	},
	
	/** Prepares and triggers the evaluation of the given feature.
	*
	*@private
	*/
	evaluateFeature: function evaluateFeature(feature) {
		try {
			feature.test().then(this.handleFeatureResult.bind(this, feature, true),
								this.handleFeatureResult.bind(this, feature)); // leave last arg to pass failure description
		} catch (error) {
			if (growl)
				growl('Error!\n' + error, { priority: 4 });
			driver.quit();
			throw error;
		}
	},
	
	/** Callback handler upon feature evaluation.
	* Displays result, errors if there were any, and calls the `postFeature` handler.
	*
	*@private
	*
	*@see	#postFeature
	*/
	handleFeatureResult: function handleFeatureResult(feature, message) {
		if (message === true) {
			logger.info('✔	' + feature.description);
		} else {
			logger.warn('✘	' + feature.description);
			logger.debug('	' + message);
			this.failed = true;
		}
		
		this.postFeature();
	},
	
	/** Increments the feature index, starts evaluation of the next feature, and quits the driver if all features were evaluated.
	*
	*@private
	*/
	postFeature: function postFeature() {
		this.currentFeature++;
		
		if (this.currentFeature < this.features.length)
			this.evaluateFeature(this.features[this.currentFeature]);
		else
			this.finish();
	},
	
	/** Informs the user of the end result and cleans up everything after tests runs.
	*
	*@param	{Boolean}	success	Whether all features succeeded or not.
	*@private
	*/	
	finish: function finish(success) {
		if (growl) {
			if (this.failed)
				growl('Test failed  :(', { priority: 4 });
			else
				growl('Test succeeded!  :)', { priority: 3 });
		}
		
		this.driver.quit();
	}
});

module.exports = Runner;	// CommonJS export
