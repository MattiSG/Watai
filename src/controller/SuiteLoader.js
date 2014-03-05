var fs			= require('fs'),
	vm			= require('vm'),
	pathsUtils	= require('path'),
	winston		= require('winston'),
	urlUtils	= require('url'),
	promises	= require('q');


var ConfigLoader	= require('mattisg.configloader');


var Widget					= require('../model/Widget'),
	Feature					= require('../model/Feature'),
	Runner					= require('./Runner'),
	browserCapabilitiesMap	= require('../lib/desiredCapabilities');


var SuiteLoader = new Class( /** @lends SuiteLoader# */ {
	/** The promise for the configuration for this test suite.
	*@type	{QPromise}
	*@private
	*/
	configPromise: null,

	/** Runner that will be fed all features found in the loaded suite.
	*@type	{Runner}
	*@private
	*/
	runner: null,

	/** Sandbox for features, widgets and data load.
	*
	*@type	{vm}
	*@see	http://nodejs.org/api/vm.html
	*@private
	*/
	context: null,

	/** List of all loaded features.
	* This array will act as a bridge between this execution context and the loading context: upon loading (in a different context), features are referenced inside this array, hence making them available in _this_ context.
	*
	*@private
	*/
	features: [],

	/**@class A SuiteLoader handles all test description files loading and Runner setup.
	* A test description folder should contain a `config` file, and any number of feature (`*Feature.js`) and widget (`*Widget.js`) description files.
	*
	* Features will be loaded in an internally-managed Runner, and all Widgets, Features and datasets will be made available in an internally-managed VM context (i.e. every definition is made in isolation).
	*
	*@constructs
	*@param	{String}	path		Path to the folder containing a test description. Trailing slashes will be normalized, don't worry about them  :)
	*@param	{Hash}		[config]	A configuration object that will override the loaded config file.
	*/
	initialize: function init(path, config) {
		this.path = pathsUtils.resolve(path) + '/';	//TODO: Node 0.8 has path.sep

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

	/** Transforms the given partial config hash from a form that may contain user shortcuts to a more complete form that is usable for the loaded test suite.
	*
	*@param		{Hash}	config	The config values to load.
	*@returns	{Hash}	The given config values, possibly transformed.
	*@private
	*/
	parseConfigStep: function parseConfigStep(config) {
		if (config.baseURL)
			config.baseURL = this.objectifyURL(config.baseURL);

		if (config.seleniumServerURL)
			config.seleniumServerURL = this.objectifyURL(config.seleniumServerURL);

		return config;
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
			var msg = 'No baseURL was found in any "' + SuiteLoader.paths.config + '" file in directories above "' + this.path + '"';
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
			if (typeof value == 'function') {
				if (! value.length) {	// a function with no arg is executed synchronously
					config[key] = value();
				} else if (value.length == 1) {	// if it has args, consider the first one is a callback	// DEPRECATED, TO REMOVE IN v0.7
					var promise = promises.defer();

					value(function(result) {
						config[key] = result;
						promise.resolve(key);
					});

					asyncElements.push(promise.promise);
				} else {	// DEPRECATED CONDITION: should become the default in v0.7; to keep compatibility with v0.6.0, a second argument is used to trigger promises
					var passedDeferredObject = promises.defer();
					var asyncEntry = promises.fcall(value, passedDeferredObject, true)	// DEPRECATED second param, useless in v0.7; used to give meaning to the promise-triggering argument in v0.6
							.then(function(configEntry) {
								config[key] = configEntry;
							}, function(err) {
								err.code = 'BAD_CONFIG';
								throw err;
							});
					asyncElements.push(asyncEntry);
				}
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

	/** Returns a promise for the runner that contains all features of this suite.
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
			this.runner.killDriver();	// TODO: should starting the driver be delayed until all files have been loaded? Slower startup for functioning cases, less annoyance for erroneous suites.
			throw err;
		}.bind(this));
	},

	/** Generates the list of variables that will be offered globally to Widgets, Features and Data elements.
	*
	*@see	http://nodejs.org/api/vm.html#vm_vm_runincontext_code_context_filename
	*@returns	{Hash}	The context description, i.e. a list of elements to offer globally in the suite loading context.
	*@private
	*/
	buildContext: function buildContext() {
		var result = {
			// used for instantiation
			Widget: Widget,
			Feature: Feature,
			// making it available for global access like loading URLs, getting title...
			driver: this.runner.getDriver(),
			config: this.config
		}

		result[SuiteLoader.contextGlobals.featuresList] = this.features;	// hook to pass instantiated features to this context
		result[SuiteLoader.contextGlobals.widgetsList] = {};	// stays in the managed context, but necessary for features to have a reference to all widgets, since they are evaluated in _this_ context, not their instanciation one…

		result[SuiteLoader.contextGlobals.log] = winston.loggers.get('load').info;	// this has to be passed, for simpler access, but mostly because the `console` module is not automatically loaded

		result[SuiteLoader.contextGlobals.assert] = require('assert');
		result[SuiteLoader.contextGlobals.storage] = {};

		return result;
	},

	/** Callback handler after `readdir`ing the test description directory.
	*
	*@param	{Array.<String>}	files	Array of file paths to examine.
	*@returns	{Runner}	The runner in which all the elements have been loaded.
	*@throws	{Error}		Code "NO_FEATURES" if no features are found.
	*
	*@see	http://nodejs.org/api/fs.html#fs_fs_readdir_path_callback
	*@private
	*/
	loadAllFiles: function loadAllFiles(files) {
		var featureFiles	= {},
			widgetFiles		= [],
			without			= this.config.without.map(function(index) { return '' + index });	// cast to string to allow for comparison with parsed indices

		files.forEach(function(file) {
			var match;	// if capturing parentheses are used in the file type detection regexp (see SuiteLoader.paths), this var holds the `match()` result

			if (file.match(SuiteLoader.paths.dataMarker)) {
				this.loadData(this.path + file);
			} else if (file.match(SuiteLoader.paths.widgetMarker)) {
				widgetFiles.push(this.path + file);	// don't load them immediately in order to make referenced data values available first
			} else if (match = file.match(SuiteLoader.paths.featureMarker)) {
				var featureIndex = match[1];	// first capturing parentheses in the featureMarker RegExp have to match the feature's numerical ID
				if (without.contains(featureIndex))
					without = without.erase(featureIndex);
				else
					featureFiles[featureIndex] = this.path + file;	// don't load them immediately in order to make referenced widgets available first
			}
		}, this);

		if (Object.getLength(featureFiles) <= 0) {
			var message = 'No feature found';

			if (this.config.without.length)
				message += ' after ignoring features ' + this.config.without.join(', ');

			var error = new Error(message);
			error.code = 'NO_FEATURES';
			throw error;
		}

		if (without.length) {
			var error = new Error('The following features were to be ignored but could not be found: ' + without);
			error.code = 'FEATURES_NOT_FOUND';
			throw error;
		}


		widgetFiles.forEach(this.loadWidget.bind(this));
		Object.each(featureFiles, this.loadFeature, this);

		return this.runner;
	},

	attachViewsTo: function attachViewsTo(runner) {
		Array.from(this.config.views).each(function(viewName) {
			try {
				var viewClass = require('../view/Runner/' + viewName);
				new viewClass(runner);
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
	*@param	dataFile	Path to a data description file. This is simply a list of variable definitions.
	*@returns	{SuiteLoader}	This SuiteLoader, for chaining.
	*
	*@see	#loadAllFiles
	*/
	loadData: function loadData(dataFile) {
		winston.loggers.get('load').verbose('~ loading ' + dataFile);

		try {
			vm.runInContext(fs.readFileSync(dataFile),
							this.context,
							dataFile);
		} catch (error) {
			winston.loggers.get('load').error('**Error in file "' + dataFile + '"**', { path : dataFile });	// TODO: is it really useful to add this info?
			throw error;
		}

		return this;
	},

	/** Loads the given file as a widget globally into this Loader's managed namespace.
	*
	*@param	widgetFile	Path to a widget description file. See examples to see how such a file should be written.
	*@returns	{SuiteLoader}	This SuiteLoader, for chaining.
	*
	*@see	#loadAllFiles
	*/
	loadWidget: function loadWidget(widgetFile) {
		winston.loggers.get('load').verbose('- loading ' + widgetFile);

		var widgetName = pathsUtils.basename(widgetFile, '.js');

		try {
			vm.runInContext(widgetName + ' = '
							+ '__widgets__["' + widgetName + '"] = '
							+ 'new Widget("' + widgetName + '", '
							+ '{' + fs.readFileSync(widgetFile) + '},'
							+ 'driver);',
							this.context,
							widgetFile);
		} catch (error) {
			winston.loggers.get('load').error('**Error in file "' + widgetFile + '"**', { path: widgetFile });	// TODO: is it really useful to add this info?
			throw error;
		}

		return this;
	},

	/** Loads the given file as a feature into this SuiteLoader's underlying runner.
	*
	*@param		{String}	featureFile	Path to a feature description file. See examples to see how such a file should be written.
	*@param		{Number}	featureId	Numerical identifier of the feature to load.
	*@returns	{SuiteLoader}	This SuiteLoader, for chaining.
	*
	*@see	#loadAllFiles
	*/
	loadFeature: function loadFeature(featureFile, featureId) {
		winston.loggers.get('load').verbose('+ loading ' + featureFile);

		var featureParams = [
			'featureContents.description',
			'featureContents.scenario',
			'__widgets__',
			'config',
			featureId
		];

		try {
			vm.runInContext('var featureContents = {' + fs.readFileSync(featureFile) + '};'
							+ '__features__.push(new Feature('
							+ featureParams.join(',')
							+ '));',
							this.context,
							featureFile);
		} catch (error) {
			winston.loggers.get('load').error('**Error in file "' + featureFile + '"**', { path: featureFile });	// TODO: is it really useful to add this info?
			throw error;
		}

		this.runner.addFeature(this.features.pop());

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
	/** If a file matches this RegExp, it is considered as a feature description to be loaded.
	*/
	featureMarker:	/^([0-9]+)(.+)Feature.js$/i,
	/** If a file matches this RegExp, it is considered as a widget description to be loaded.
	*/
	widgetMarker:	/(.+)Widget.js$/i,
	/** If a file matches this RegExp, it is considered as a data suite to be loaded.
	*/
	dataMarker:		/(.+)Data.js$/i
}

/** Lists all predefined global variables in the suite loading context, and how they are referenced in that context.
*
*@constant
*/
SuiteLoader.contextGlobals = {
	/** A hash containing all loaded widgets, indexed on their name.
	*/
	widgetsList:	'__widgets__',
	/** An array containing all features, in their loading order.
	*/
	featuresList:	'__features__',
	/** The name of the offered logging function.
	*/
	log:			'log',
	/** The name of the offered assertion library.
	*/
	assert:			'assert',
	/** The name of the offered storage hash, in which features may store values to compare them over time.
	*/
	storage:		'storage'
}


module.exports = SuiteLoader;	// CommonJS export
