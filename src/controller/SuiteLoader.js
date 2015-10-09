var fs			= require('fs'),
	vm			= require('vm'),
	pathsUtils	= require('path'),
	winston		= require('winston'),
	urlUtils	= require('url'),
	promises	= require('q');


var ConfigLoader	= require('mattisg.configloader');


var Component				= require('../model/Component'),
	Scenario				= require('../model/Scenario'),
	Runner					= require('./Runner'),
	browserCapabilitiesMap	= require('../lib/desiredCapabilities');


var SuiteLoader = new Class( /** @lends SuiteLoader# */ {
	/** The promise for the configuration for this test suite.
	*@type	{QPromise}
	*@private
	*/
	configPromise: null,

	/** Runner that will be fed all scenarios found in the loaded suite.
	*@type	{Runner}
	*@private
	*/
	runner: null,

	/** Sandbox for scenarios, components and fixture load.
	*
	*@type	{vm}
	*@see	{@link http://nodejs.org/api/vm.html|Node::vm}
	*@private
	*/
	context: null,

	/** List of all loaded scenarios.
	* This array will act as a bridge between this execution context and the loading context: upon loading (in a different context), scenarios are referenced inside this array, hence making them available in _this_ context.
	*
	*@private
	*/
	scenarios: [],

	/**@class A SuiteLoader handles all test description files loading and Runner setup.
	* A test description folder should contain a `config` file, and any number of scenario (`*Scenario.js`) and component (`*Component.js`) description files.
	*
	* Scenarios will be loaded in an internally-managed Runner, and all Components, Scenarios and fixtures will be made available in an internally-managed VM context (i.e. every definition is made in isolation).
	*
	*@constructs
	*@param	{String}	path		Path to the folder containing a test description. Trailing slashes will be normalized, don't worry about them  :)
	*@param	{Hash}		[config]	A configuration object that will override the loaded config file.
	*/
	initialize: function init(path, config) {
		this.path = pathsUtils.resolve(path) + '/';	// TODO: Node 0.8 has path.sep

		var config = new ConfigLoader({
			from		: this.path,
			appName		: 'watai',
			override	: config,
			visitAlso	: pathsUtils.dirname(__dirname),	// load defaults from there
			observer	: winston.loggers.get('init').silly,
			transform	: this.parseConfigStep.bind(this)
		}).load(SuiteLoader.paths.config);

		this.configPromise = this.parseConfig(config);
	},

	/** Validates and possibly transforms the given config hash to a form that is usable for the loaded test suite.
	*
	*@param		{Hash}	config	The config values to use for this test suite.
	*@returns	{Hash}	The given config, validated and possibly transformed.
	*@throws	{ReferenceError}	If no base URL is found in the given config.
	*@private
	*/
	parseConfig: function parseConfig(config) {
		if (! config.baseURL) {
			var msg = 'No baseURL was found in any "' + SuiteLoader.paths.config + '" file in "' + this.path + '" nor any parent directory';
			winston.loggers.get('load').error(msg);
			throw new ReferenceError(msg);
		}

		if (! config.name)
			config.name = pathsUtils.basename(this.path, '/');	// [RETROCOMPATIBILITY] remove a possible trailing separator for Node < 0.9.6

		if (config.browser) {
			if (! browserCapabilitiesMap[config.browser]) {
				throw new ReferenceError('The browser "' + config.browser + '" does not have any standard definition.\n'
										 + 'Are you sure you spelled it properly?\n'
										 + 'If you did not make any typo, provide a full "driverCapabilities" hash rather than a "browser" name.\n'
										 + 'More details at <https://github.com/MattiSG/Watai/wiki/Configuration#browser>.');
			}

			config.driverCapabilities = Object.merge(browserCapabilitiesMap[config.browser], config.driverCapabilities);
		}

		var asyncElements = [];

		Object.each(config, function(value, key) {
			if (typeof value != 'function')
				return;

			if (! value.length) {	// a function with no arg is executed synchronously
				config[key] = value();
			} else {
				var passedDeferredObject = promises.defer();
				var asyncEntry = promises.fcall(value, passedDeferredObject)
						.then(function(configEntry) {
							config[key] = configEntry;
						}, function(err) {
							err.code = 'BAD_CONFIG';
							throw err;
						});
				asyncElements.push(asyncEntry);
			}
		});

		return promises.all(asyncElements).thenResolve(config);
	},

	/** Transforms the given partial config hash from a form that may contain user shortcuts to a more complete form that is usable for the loaded test suite.
	*
	*@param		{Hash}	config	The config values to load.
	*@param		{Hash}	alreadyLoaded	The config values that were previously parsed.
	*@returns	{Hash}	The given config values, possibly transformed.
	*@private
	*/
	parseConfigStep: function parseConfigStep(config, alreadyLoaded) {
		if (config.baseURL)
			config.baseURL = this.objectifyURL(config.baseURL);

		if (config.seleniumServerURL)
			config.seleniumServerURL = this.objectifyURL(config.seleniumServerURL);

		if (config.tags && alreadyLoaded.tags)
			config.tags = alreadyLoaded.tags.concat(config.tags);

		return config;
	},

	/** Uniforms an URL, specified as a string or an URL object (as specified by the `url` Node core module), to an "overridable" URL object, i.e. an object with keys that take precedence over others removed.
	*
	*@param		{String|Hash}	url	The URL to transform.
	*@returns	{Hash}			The given URL, represented as an object as specified by the `url` Node core module.
	*@private
	*/
	objectifyURL: function objectifyURL(url) {
		if (typeof url == 'string') {
			url = urlUtils.parse(url);	// url.parse is idempotent for objects, so adding it inside allows support for string URLs, and backward compatibility
			delete url.host;	// the `host` value overrides both `hostname` and `port`; since we want to allow specific overrides and `url.parse` fills all fields, delete the redundant one
			delete url.path;	// the `path` value overrides both `pathname` and `search`; since we want to allow specific overrides and `url.parse` fills all fields, delete the redundant one
		}

		return url;
	},

	/** Returns a promise for the runner that contains all scenarios of this suite.
	*
	*@returns	{Promise<Runner>}
	*/
	getRunner: function getRunner() {
		if (this.runner)
			return promises(this.runner);

		return this.configPromise.then(function(config) {
			this.config = config;
			this.runner = new Runner(config);
			this.attachViewsTo(this.runner);
			this.context = vm.createContext(this.buildContext());

			return this.path;
		}.bind(this))
		.then(promises.nfbind(fs.readdir))
		.then(this.loadAllFiles.bind(this))
		.fail(function(err) {
			this.runner.quitBrowser();	// TODO: should starting the driver be delayed until all files have been loaded? Slower startup for functioning cases, less annoyance for erroneous suites.
			throw err;
		}.bind(this));
	},

	/** Generates the list of variables that will be offered globally to Components, Scenarios and Fixture elements.
	*
	*@see	{@link http://nodejs.org/api/vm.html#vm_vm_runincontext_code_context_filename|Node::vm.runInContext}
	*@returns	{Hash}	The context description, i.e. a list of elements to offer globally in the suite loading context.
	*@private
	*/
	buildContext: function buildContext() {
		var result = {
			// used for instantiation
			Component: Component,
			Scenario: Scenario,
			// making it available for global access like loading URLs, getting title...
			driver: this.runner.getDriver(),
			config: this.config
		}

		result[SuiteLoader.contextGlobals.scenariosList] = this.scenarios;	// hook to pass instantiated scenarios to this context
		result[SuiteLoader.contextGlobals.componentsList] = {};	// stays in the managed context, but necessary for scenarios to have a reference to all components, since they are evaluated in _this_ context, not their instanciation one…

		result[SuiteLoader.contextGlobals.log] = winston.loggers.get('load').info;	// this has to be passed, for simpler access, but mostly because the `console` module is not automatically loaded

		result[SuiteLoader.contextGlobals.assert] = require('assert');

		return result;
	},

	/** Callback handler after `readdir`ing the test description directory.
	*
	*@param	{Array.<String>}	files	Array of file paths to examine.
	*@returns	{Runner}	The runner in which all the elements have been loaded.
	*@throws	{Error}		Code "NO_SCENARIOS" if no scenarios are found.
	*
	*@see	{@link http://nodejs.org/api/fs.html#fs_fs_readdir_path_callback|Node::fs.readdir}
	*@private
	*/
	loadAllFiles: function loadAllFiles(files) {
		var scenarioFiles			= {},
			componentFiles			= [],
			ignoredScenariosIndices	= this.config.ignore.map(function(index) { return '' + index });	// cast to string to allow for comparison with parsed indices

		files.forEach(function(file) {
			var match;	// if capturing parentheses are used in the file type detection regexp (see SuiteLoader.paths), this var holds the `match()` result

			if (file.match(SuiteLoader.paths.fixtureMarker)) {
				this.loadFixture(this.path + file);
			} else if (file.match(SuiteLoader.paths.componentMarker)) {
				componentFiles.push(this.path + file);	// don't load them immediately in order to make referenced fixture values available first
			} else if (match = file.match(SuiteLoader.paths.scenarioMarker)) {
				var scenarioIndex = match[1];	// first capturing parentheses in the scenarioMarker RegExp have to match the scenario's numerical ID
				if (ignoredScenariosIndices.contains(scenarioIndex))
					ignoredScenariosIndices = ignoredScenariosIndices.erase(scenarioIndex);
				else
					scenarioFiles[scenarioIndex] = this.path + file;	// don't load them immediately in order to make referenced components available first
			}
		}, this);

		if (ignoredScenariosIndices.length) {
			var error = new Error('The following scenarios were to be ignored but could not be found: ' + ignoredScenariosIndices);
			error.code = 'SCENARIOS_NOT_FOUND';
			throw error;
		}

		if (Object.getLength(scenarioFiles) <= 0) {
			var message = 'No scenario found';

			if (this.config.ignore.length)
				message += ' after ignoring scenarios ' + this.config.ignore.join(', ');

			var error = new Error(message);
			error.code = 'NO_SCENARIOS';
			throw error;
		}


		componentFiles.forEach(this.loadComponent.bind(this));
		Object.each(scenarioFiles, this.loadScenario, this);

		return this.runner;
	},

	attachViewsTo: function attachViewsTo(runner) {
		Array.from(this.config.views).each(function(viewName) {
			try {
				var ViewClass = require('../view/Runner/' + viewName);
				new ViewClass(runner);
			} catch (err) {
				throw new ReferenceError([
					err.message, '',
					'The view "' + viewName + '" could not be loaded.',
					'Are you sure you did not misspell it?',
					'If not, then it might be that the config file you are using does not match the executed Watai version.'
				].join('\n'));
			}
		});
	},

	/** Loads the given definitions globally into this Loader's managed namespace.
	*
	*@param	{String}	fixtureFile	Path to a fixture description file. This is simply a list of variable definitions.
	*@returns	{SuiteLoader}	This SuiteLoader, for chaining.
	*
	*@see	loadAllFiles
	*/
	loadFixture: function loadFixture(fixtureFile) {
		winston.loggers.get('load').verbose('~ loading ' + fixtureFile);

		try {
			vm.runInContext(fs.readFileSync(fixtureFile),
							this.context,
							fixtureFile);
		} catch (error) {
			winston.loggers.get('load').error('**Error in file "' + fixtureFile + '"**', { path : fixtureFile });	// TODO: is it really useful to add this info?
			throw error;
		}

		return this;
	},

	/** Loads the given file as a component globally into this Loader's managed namespace.
	*
	*@param	{String}	componentFile	Path to a component description file. See examples to see how such a file should be written.
	*@returns	{SuiteLoader}	This SuiteLoader, for chaining.
	*
	*@see	loadAllFiles
	*/
	loadComponent: function loadComponent(componentFile) {
		winston.loggers.get('load').verbose('- loading ' + componentFile);

		var componentName = pathsUtils.basename(componentFile, '.js');

		try {
			vm.runInContext(componentName + ' = '
							+ '__components__["' + componentName + '"] = '
							+ 'new Component("' + componentName + '", '
							+ '{' + fs.readFileSync(componentFile) + '},'
							+ 'driver);',
							this.context,
							componentFile);
		} catch (error) {
			winston.loggers.get('load').error('**Error in file "' + componentFile + '"**', { path: componentFile });	// TODO: is it really useful to add this info?
			throw error;
		}

		return this;
	},

	/** Loads the given file as a scenario into this SuiteLoader's underlying runner.
	*
	*@param		{String}	scenarioFile	Path to a scenario description file. See examples to see how such a file should be written.
	*@param		{Number}	scenarioId	Numerical identifier of the scenario to load.
	*@returns	{SuiteLoader}	This SuiteLoader, for chaining.
	*
	*@see	loadAllFiles
	*/
	loadScenario: function loadScenario(scenarioFile, scenarioId) {
		winston.loggers.get('load').verbose('+ loading ' + scenarioFile);

		var scenarioParams = [
			'scenarioContents.description',
			'scenarioContents.steps || scenarioContents.scenario',  // <v0.7 compatibility; drop `.scenario` after v0.7
			'__components__',
			'config',
			scenarioId
		];

		try {
			vm.runInContext('var scenarioContents = {' + fs.readFileSync(scenarioFile) + '};'
							+ '__scenarios__.push(new Scenario('
							+ scenarioParams.join(',')
							+ '));',
							this.context,
							scenarioFile);
		} catch (error) {
			winston.loggers.get('load').error('**Error in file "' + scenarioFile + '"**', { path: scenarioFile });	// TODO: is it really useful to add this info?
			throw error;
		}

		this.runner.addScenario(this.scenarios.pop());

		return this;
	}
});

/** Defines all naming patterns conventions for test description folders.
* Used for magical autoload.
*
*@constant
*/
SuiteLoader.paths = {
	/** Exact name of configuration files to look for in description folders.
	*/
	config:			'config',
	/** If a file matches this RegExp, it is considered as a scenario description to be loaded.
	*/
	scenarioMarker:	/^([0-9]+)(.+)(Scenario|Feature).js$/i, // Feature is kept for v<0.7 compatibility
	/** If a file matches this RegExp, it is considered as a component description to be loaded.
	*/
	componentMarker:	/(.+)(Component|Widget).js$/i,	// Widget is kept for v<0.7 compatibility
	/** If a file matches this RegExp, it is considered as a data suite to be loaded.
	*/
	fixtureMarker:		/(.+)(Fixture|Data).js$/i // Data is kept for v<0.7 compatibility
}

/** Lists all predefined global variables in the suite loading context, and how they are referenced in that context.
*
*@constant
*/
SuiteLoader.contextGlobals = {
	/** A hash containing all loaded components, indexed on their name.
	*/
	componentsList:	'__components__',
	/** An array containing all scenarios, in their loading order.
	*/
	scenariosList:	'__scenarios__',
	/** The name of the offered logging function.
	*/
	log:			'log',
	/** The name of the offered assertion library.
	*/
	assert:			'assert',
}


module.exports = SuiteLoader;	// CommonJS export
