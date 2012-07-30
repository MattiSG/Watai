var webdriver = require('selenium-webdriverjs');
var growl;
try {
	growl = require('growl');
} catch (e) {
	growl = false;
}
	
var logger = require('winston').loggers.get('suites');


var Runner = new Class( /** @lends Runner# */ {

	Binds: [ 'startNextFeature' ],	// methods listed here will be automatically bound to the current instance

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

	/**@class	Manages a set of features and the driver in which they are run.
	*
	* A `Runner` is mostly set up through a configuration object.
	* Such an object should contain the following items:
	*	- `baseURL`: the URL at which the driver should start;
	*	- `driverCapabilities`: an object that will be passed straight to the WebDriver instance.
	*
	* The chosen implementation for WebDriver is the [official WebDriverJS](https://code.google.com/p/selenium/wiki/WebDriverJs) by the Selenium team. Make sure you use this module and not one of the other implementations, since this code has not been tested with any other.
	*
	*@constructs
	*@param	{Object}	config	A configuration object, as defined above.
	*@see	WebDriver.Builder#withCapabilities
	*/
	initialize: function init(config) {
		this.config = config;
		
		this.driver = new webdriver.Builder()
						.usingServer(this.config.seleniumServerURL)
						.withCapabilities(this.config.driverCapabilities)
						.build();

		this.driver.manage().timeouts().implicitlyWait(this.config.timeout * 1000);
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
		this.currentFeature = -1;

		this.driver.get(this.config.baseURL).then(this.startNextFeature);
		
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
	* Displays result, errors if there were any, and calls the `startNextFeature` handler.
	*
	*@private
	*
	*@see	#startNextFeature
	*/
	handleFeatureResult: function handleFeatureResult(feature, message) {
		var symbol,
			loggerMethod;
		if (message === true) {
			symbol = '✔';
			loggerMethod = 'info';
		} else {
			if (message.errors.length > 0) {
				symbol = '⚠';
				loggerMethod = 'error';
			} else {
				symbol = '✘';
				loggerMethod = 'warn';
			}

			this.showFailureDetails(message);
			this.failed = true;
		}

		logger[loggerMethod](symbol + '	' + feature.description);
		
		this.startNextFeature();
	},

	/** Presents details of a test failure / error to the user.
	*
	*@param	{Object.<Array.<String>>}	A hash with two keys containing arrays of strings giving details on failures. One key is `failures` (reasons for test rejection), the other `errors` (reasons for impossibility to evaluate test).
	*@private
	*/
	showFailureDetails: function showFailureDetails(report) {
		if (report.errors.length > 0)
			report.errors.forEach(logger.debug);
		
		if (report.failures.length > 0)
			report.failures.forEach(logger.debug);
	},

	/** Increments the feature index, starts evaluation of the next feature, and quits the driver if all features were evaluated.
	*
	*@private
	*/
	startNextFeature: function startNextFeature() {
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
