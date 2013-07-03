var url = require('url');


var webdriver	= require('wd'),
	promises	= require('q');


var Runner = new Class( /** @lends Runner# */ {

	Extends: require('events').EventEmitter,

	/** The promise object for results, resolved when all features of this Runner have been evaluated.
	*@type	{Promise}
	*/
	promise: null,

	/** A hash mapping all failed features to their reasons for rejection.
	*If empty, the run was successful.
	*@type	{Object.<Feature, String>}
	*@private
	*/
	failures: Object.create(null),

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

	/** Whether the baseURL page has been loaded or not.
	*@type	{Boolean}
	*@private
	*/
	ready: false,

	/** True if the driver is currently waiting for the baseURL page to load.
	*@type	{Boolean}
	*@private
	*/
	loading: false,

	/** The promise controller (deferred object) for results, resolved when all features of this Runner have been evaluated.
	*@type	{q.deferred}
	*@private
	*/
	deferred: null,


	/**@class	Manages a set of features and the driver in which they are run.
	*
	* A `Runner` is mostly set up through a configuration object.
	* Such an object MUST contain the following items:
	*	- `baseURL`: the URL at which the driver should start;
	* It SHOULD contain:
	*	- `driverCapabilities`: an object that will be passed straight to the WebDriver instance, that describes the browser on which the tests should be run.
	* It MAY contain:
	*	- `name`: the name of the suite. Defaults to the name of the containing folder.
	*
	*@constructs
	*@param	{Object}	config	A configuration object, as defined above.
	*/
	initialize: function init(config) {
		this.parseConfig(config);

		this.initDriver();
	},

	/** Checks the passed configuration hash for any missing mandatory definitions.
	*
	*@param	{Object}	config	The configuration object to check (may not be defined, which will return an error).
	*@return	{Error|null}	An error object describing the encountered problem, or `null` if no error was found.
	*@see	#initialize	For details on the configuration object.
	*/
	parseConfig: function parseConfig(config) {
		if (! config)
			throw new Error('You need to provide a configuration to create a Runner!');

		try {
			config.seleniumServerURL = url.format(config.seleniumServerURL);
		} catch (err) {
			throw new Error('The given Selenium server URL ("' + config.seleniumServerURL + '") is unreadable (' + err.message + ')');
		}

		try {
			config.baseURL = url.format(config.baseURL);	// allow taking objects describing the URL
		} catch (err) {
			throw new Error('The given base URL ("' + config.baseURL + '") is unreadable (' + err.message + ')');
		}

		this.config = config;
	},

	/** Initializes the underlying driver of this Runner.
	*@return	this	For chainability.
	*@private
	*/
	initDriver: function initDriver() {
		this.ready = false;
		this.driver = this.buildDriverFrom(this.config);
		this.loadBaseURL();
		return this;
	},

	/** Navigates to the base page for this runner.
	*@private
	*/
	loadBaseURL: function loadBaseURL() {
		this.loading = true;
		this.driver.get(this.config.baseURL).then(this.onReady.bind(this));
	},

	/** Constructs a new WebDriver instance based on the given configuration.
	*
	*@param	{Object}	config	The configuration object based on which the driver will be built.
	*@return	{WebDriver}	The matching WebDriver instance.
	*@see	#initialize	For details on the configuration object.
	*@private
	*/
	buildDriverFrom: function buildDriverFrom(config) {
		var seleniumServer = url.parse(config.seleniumServerURL);	// TODO: get the URL already parsed from the config instead of serializing it at each step

		var result = webdriver.promiseRemote();

		result.init(Object.merge(config.driverCapabilities, {
			host: seleniumServer.hostname,
			port: seleniumServer.port
		}));

		return result;
	},

	/** Tells whether the underlying driver of this Runner has loaded the base page or not.
	* This changes after the `ready` event has been emitted by this Runner.
	*
	*@return	{Boolean}	`true` if the page has been loaded, `false` otherwise.
	*/
	isReady: function isReady() {
		return this.ready;
	},

	/** Emits the "ready" event and updates this runner's status.
	*@private
	*/
	onReady: function onReady() {
		this.loading = false;
		this.ready = true;
		this.emit('ready', this);
	},

	/** Adds the given Feature to the list of those that this Runner will evaluate.
	*
	*@param	{Feature}	feature	A Feature for this Runner to evaluate.
	*@return	This Runner, for chaining.
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

	/** Evaluates all features added to this Runner.
	* Emits "driverInit".
	*
	*@returns	{Promise}	A promise for results, resolved if all features pass (param: this Runner), rejected otherwise (param: hash mapping failed features to their reasons for rejection, or an Error if an error appeared in the runner itself or the evaluation was cancelled).
	*@see	#addFeature
	*/
	test: function test() {
		this.deferred = promises.defer();
		this.promise = this.deferred.promise;

		this.emit('driverInit', this);

		if (this.ready) {
			this.start();
		} else {	// we already run before, or we just initialized
			this.once('ready', this.start.bind(this));

			if (! this.loading) {
				if (this.driver)
					this.loadBaseURL();
				else	// the driver has been explicitly killed before running again
					this.initDriver();
			}
		}

		return this.promise;
	},

	/** Actually starts the evaluation process.
	* Emits "start".
	*
	*@private
	*/
	start: function start() {
		this.failures = Object.create(null);
		this.currentFeature = -1;

		this.emit('start', this);

		this.startNextFeature();
	},

	/** Increments the feature index, starts evaluation of the next feature, and quits the driver if all features were evaluated.
	*
	*@private
	*/
	startNextFeature: function startNextFeature() {
		this.currentFeature++;

		if (this.ready
			&& this.currentFeature < this.features.length)
			this.evaluateFeature(this.features[this.currentFeature]);
		else
			this.finish();
	},

	/** Prepares and triggers the evaluation of the given feature.
	*
	*@private
	*/
	evaluateFeature: function evaluateFeature(feature) {
		this.emit('feature', feature);

		feature.test().then(this.startNextFeature.bind(this),
							this.handleFeatureFailure.bind(this, feature)); // leave last arg to pass failure description
	},

	/** Callback handler upon feature evaluation. Flags failures and calls the `startNextFeature` handler.
	*
	*@private
	*@see	#startNextFeature
	*/
	handleFeatureFailure: function handleFeatureFailure(feature, message) {
		this.failures[feature] = message;
		this.failed = true;

		this.startNextFeature();
	},

	/** Informs of the end result and cleans the instance up after tests runs.
	*
	*@private
	*/
	finish: function finish() {
		var resolve			= this.deferred.resolve.bind(this.deferred, this),
			reject			= this.deferred.reject.bind(this.deferred, this.failures),
			fulfill			= resolve,
			precondition	= (this.config.quit == 'always'
								? this.killDriver
								: this.markUsed
							  ).bind(this),
			failures		= this.failures;	// copy them in case the precondition cleans them up

		if (Object.getLength(failures) == 0) {
			if (this.config.quit == 'on success')
				precondition = this.killDriver.bind(this);
		} else {
			fulfill = reject;
		}

		promises.when(precondition(), fulfill, reject);
	},

	/** Updates inner state so that consequent calls to `test()` know they need to reload the driver.
	*
	*@private
	*/
	markUsed: function markUsed() {
		this.ready = false;
	},

	/** Stops the current evaluation.
	*/
	cancel: function cancel() {
		this.removeListener('ready', this.start);
		return this.finish();
	},

	/** Quits the managed browser.
	*
	*@return	{Promise}	A promise resolved once the browser has been properly quit.
	*/
	killDriver: function killDriver() {
		var driver = this.driver;
		this.driver = null;

		this.markUsed();

		return (driver
				? driver.quit()
				: promises());	// normalize return type to a promise, so that it can safely be called even if the driver had already been quit
	},

	toString: function toString() {
		return this.config.name;
	}
});

module.exports = Runner;	// CommonJS export
