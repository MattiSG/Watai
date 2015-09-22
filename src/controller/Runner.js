var url = require('url');


var webdriver	= require('wd'),
	promises	= require('q');


var Runner = new Class( /** @lends Runner# */ {

	Extends: require('events').EventEmitter,

	/** The promise object for results, resolved when all scenarios of this Runner have been evaluated.
	*@type	{QPromise}
	*/
	promise: null,

	/** A hash mapping all failed scenarios to their reasons for rejection.
	*If empty, the run was successful.
	*@type	{Object.<Scenario, String>}
	*@private
	*/
	failures: {},

	/** The list of all scenarios to evaluate with this configuration.
	*@type	{Array.<Scenario>}
	*@private
	*/
	scenarios: [],

	/** Index of the currently evaluated scenario.
	*@type	{integer}
	*@private
	*/
	currentScenario: 0,

	/** Promise for the driver to be initialized.
	*
	*@type	{QPromise}
	*@private
	*/
	initialized: null,

	/** Promise for the baseURL to be loaded.
	*
	*@type	{QPromise}
	*@private
	*/
	baseUrlLoaded: null,

	/** The promise controller (deferred object) for results, resolved when all scenarios of this Runner have been evaluated.
	*@type	{q.deferred}
	*@private
	*/
	deferred: null,


	/**@class	Manages a set of scenarios and the driver in which they are run.
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
		this.config = this.parseConfig(config);

		this.initDriver();
	},

	/** Checks the passed configuration hash for any missing mandatory definitions.
	*
	*@param		{Object}	config	The configuration object to check (may not be defined, which will return an error).
	*@throws	{Error}	An error object describing the encountered problem.
	*@see		{@link initialize}	For details on the configuration object.
	*/
	parseConfig: function parseConfig(config) {
		if (! config)
			throw new Error('You need to provide a configuration to create a Runner!');

		config.baseURL			 = this.formatURL(config, 'baseURL');
		config.seleniumServerURL = this.formatURL(config, 'seleniumServerURL');

		return config;
	},

	/** Checks the presence and formats the element stored in the given config, expecting an URL.
	*
	*@param		{Object}	config	The configuration to examine.
	*@param		{String}	key		The configuration key that holds the URL to check and reformat.
	*@throws	{Error}		If the given value is not a valid URL.
	*@returns	{String}	The URL stored in the given config, normalized.
	*/
	formatURL: function formatURL(config, key) {
		if (! config[key]) {
			throw new Error('No ' + key + ' was found in the given config')
		}

		try {
			var result = url.format(config[key]);	// allow taking objects describing the URL

			if (! result)
				throw 'parsed value is empty';	// [RETROCOMPATIBILITY] Node < 0.10 throws if `format`'s parameter is undefined, but ≥ 0.10 does not; to factor behavior, we'll throw ourselves

			return result;
		} catch (err) {
			throw new Error('The given ' + key + ' ("' + config[key] + '") is unreadable (' + err.message + ')');
		}
	},

	/** Initializes the underlying driver of this Runner.
	*
	*@return	{QPromise}	A promise for the driver to be initialized.
	*@private
	*/
	initDriver: function initDriver() {
		if (! this.initialized)
			this.initialized = this.buildDriverFrom(this.config);

		return this.initialized;
	},

	/** Navigates to the base page for this runner.
	*
	*@return	{QPromise}	A promise for the base page to be loaded.
	*@private
	*/
	loadBaseURL: function loadBaseURL() {
		this.loaded = this.driver.get(this.config.baseURL);

		return this.loaded.then(this.onReady.bind(this));
	},

	/** Constructs a new WebDriver instance based on the given configuration.
	*
	*@param		{Object}	config	The configuration object based on which the driver will be built.
	*@return	{QPromise}	The promise for the `driver` instance variable to be ready.
	*@see		{@link initialize}	For details on the configuration object.
	*@private
	*/
	buildDriverFrom: function buildDriverFrom(config) {
		this.driver = webdriver.promiseRemote(url.parse(config.seleniumServerURL));	// TODO: get the URL already parsed from the config instead of serializing it at each step

		return this.driver.init(Object.merge(config.driverCapabilities, {
			name	: config.name,	// TODO: find a better way to pass config elements instead of whitelisting
			tags	: config.tags,
			build	: config.build
		}));
	},

	/** Tells whether the underlying driver of this Runner has loaded the base page or not.
	*
	*@return	{Boolean}	`true` if the page has been loaded, `false` otherwise.
	*/
	isReady: function isReady() {
		return !! (this.loaded && this.loaded.isFulfilled());
	},

	/** Emits the "ready" event.
	*
	*@private
	*/
	onReady: function onReady() {
		this.emit('ready', this);
	},

	/** Adds the given Scenario to the list of those that this Runner will evaluate.
	*
	*@param	{Scenario}	scenario	A Scenario for this Runner to evaluate.
	*@return	This Runner, for chaining.
	*/
	addScenario: function addScenario(scenario) {
		this.scenarios.push(scenario);

		return this;
	},

	/** Returns the WebDriver instance this Runner created for the current run.
	*
	*@returns	WebDriver
	*/
	getDriver: function getDriver() {
		return this.driver;
	},

	/** Evaluates all scenarios added to this Runner.
	* Emits the "start" event.
	*
	*@returns	{QPromise}	A promise for results, resolved if all scenarios pass (param: this Runner), rejected otherwise (param: hash mapping failed scenarios to their reasons for rejection, or an Error if an error appeared in the runner itself or the evaluation was cancelled).
	*@see	addScenario
	*/
	test: function test() {
		this.deferred = promises.defer();
		var promise = this.promise = this.deferred.promise;

		this.emit('start', this);

		return this.initDriver()
					.then(this.loadBaseURL.bind(this))
					.then(this.start.bind(this),
						  this.deferred.reject)	// ensure failures in driver init are propagated
					.finally(function() { return promise });
	},

	/** Actually starts the evaluation process.
	*@returns	{QPromise}	The promise for this run to be finished.
	*
	*@private
	*/
	start: function start() {
		this.failures = {};
		this.currentScenario = -1;
		this.startNextScenario();

		return this.promise;
	},

	/** Increments the scenario index, starts evaluation of the next scenario, and quits the driver if all scenarios were evaluated.
	*
	*@private
	*/
	startNextScenario: function startNextScenario() {
		this.currentScenario++;

		if (this.currentScenario >= this.scenarios.length
			|| (this.config.bail && Object.getLength(this.failures)))
			this.finish();
		else
			this.evaluateScenario(this.scenarios[this.currentScenario]);
	},

	/** Prepares and triggers the evaluation of the given scenario.
	* Emits "scenario".
	*
	*@private
	*/
	evaluateScenario: function evaluateScenario(scenario) {
		this.emit('scenario', scenario);

		scenario.test()
			   .fail(this.storeFailure.bind(this, scenario)) // leave last arg to pass failure description
			   .done(this.startNextScenario.bind(this));	// TODO: make startNextScenario return a promise for the next scenario to be evaluated, and orchestrate flow around it with an array reduce
	},

	/** Callback handler upon scenario evaluation. Flags failures and prepares final error report.
	*
	*@private
	*/
	storeFailure: function storeFailure(scenario, message) {
		this.failures[scenario] = message;
		this.failed = true;
	},

	/** Informs of the end result and cleans the instance up after tests runs.
	*
	*@private
	*/
	finish: function finish() {
		var resolve			= this.deferred.resolve.bind(this.deferred, this),
			reject			= this.deferred.reject.bind(this.deferred, this.failures),
			fulfill			= resolve,
			quitBrowser		= this.quitBrowser.bind(this),
			precondition	= (this.config.quit == 'always'
								? quitBrowser
								: promises);	// Q without params simply returns a fulfilled promise

		if (Object.getLength(this.failures) > 0) {
			fulfill = reject;
		} else {
			if (this.config.quit == 'on success')
				precondition = quitBrowser;
		}

		precondition().done(fulfill, reject);
	},

	/** Quits the managed browser.
	*
	*@return	{QPromise}	A promise resolved once the browser has been properly quit.
	*/
	quitBrowser: function quitBrowser() {
		var quit = this._quitBrowser.bind(this);
		return this.initialized ? this.initialized.then(quit, quit) : promises();
	},

	/** Quits the managed browser immediately, ignoring its availability.
	*
	*@return	{QPromise}	A promise resolved once the browser has been quit.
	*@private
	*/
	_quitBrowser: function _quitBrowser() {
		return this.driver.quit().then(function() {
			this.initialized = null;
		}.bind(this));
	},

	toString: function toString() {
		return this.config.name;
	}
});

module.exports = Runner;	// CommonJS export
