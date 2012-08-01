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

	/** The first URL to load when starting the driver.
	*type	{String}
	*@private
	*/
	baseURL: '',

	/**@class	Manages a set of features and the driver in which they are run.
	*
	* A `Runner` is mostly set up through a configuration object.
	* Such an object should contain the following items:
	*	- `baseURL`: the URL at which the driver should start;
	*	- `driverCapabilities`: an object that will be passed straight to the WebDriver instance.
	*
	*@constructs
	*@param	{Object}	config	A configuration object, as defined above.
	*@see	WebDriver.Builder#withCapabilities
	*/
	initialize: function init(config) {
		if (this.error = this.findConfigError(config))
			throw this.error;	// `this` scoping is here just to avoid leaking, no usage for it

		this.baseURL = config.baseURL;
		
		this.driver = this.buildDriver(config);
	},

	/** Checks the passed configuration hash for any missing mandatory definitions.
	*
	*@param	{Object}	config	The configuration object to check (may not be defined, which will return an error).
	*@returns	{Error|null}	An error object describing the encountered problem, or `null` if no error was found.
	*@see	#initialize	For details on the configuration object.
	*/
	findConfigError: function findConfigError(config) {
		if (! config)
			return new Error('You need to provide a configuration to create a Runner!');

		if (typeof config.seleniumServerURL != 'string')
			return new Error('The given Selenium server URL ("' + config.seleniumServerURL + '") is unreadable');

		if (typeof config.baseURL != 'string')
			return new Error('The given base URL ("' + config.baseURL + '") is unreadable');

		return null;
	},

	/** Constructs a new WebDriver instance based on the given configuration.
	*
	*@param	{Object}	config	The configuration object based on which the driver will be built.
	*@returns	{WebDriver}	The matching WebDriver instance.
	*@see	#initialize	For details on the configuration object.
	*/
	buildDriver: function buildDriver(config) {
		var result = new webdriver.Builder()
						.usingServer(config.seleniumServerURL)
						.withCapabilities(config.driverCapabilities)
						.build();

		result.manage().timeouts().implicitlyWait(config.timeout * 1000);	// implicitly wait for an element to appear, for asynchronous operations

		return result;
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

		this.driver.get(this.baseURL).then(this.startNextFeature);

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
