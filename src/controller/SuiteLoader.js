var fs = require('fs'),
	pathsUtils = require('path'),
	vm = require('vm');
	
var logger = require('winston').loggers.get('steps'),
	suitesLogger = require('winston').loggers.get('suites'),
	ConfigLoader = require('mattisg.configloader');

var Widget = require('../model/Widget'),
	Feature = require('../model/Feature'),
	Runner = require('./Runner');


var SuiteLoader = new Class( /** @lends SuiteLoader# */ {
	/** Will be set to the name of the loaded test suite.
	*@private
	*/
	name: '',
	
	/** Runner that will be fed all features found in the loaded suite.
	*@type	Runner
	*@private
	*/
	runner: null,
	
	/** Sandbox for features, widgets and data load.
	* Will always offer the `driver` magical variable to give access to the WebDriver instance in user code.
	*
	*@type	VM
	*@see	
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
	* _Since we're currently in high-speed iterative development, hence without formal documentation, see the `example` folder for more information on how to write such files._
	*
	* Features will be loaded in an internally-managed Runner, and all Widgets, Features and datasets will be made available in an internally-managed VM context (i.e. every definition is made in isolation).
	*
	*@constructs
	*@param	path	Path to the folder containing a test description. Trailing slashes will be normalized, don't worry about them  :)
	*
	*@see	http://nodejs.org/api/vm.html
	*/
	initialize: function init(path) {
		this.path = pathsUtils.resolve(path) + '/';	//TODO: Node 0.8 has path.sep
		
		this.name = pathsUtils.basename(path);

		var loader = new ConfigLoader({
			from: this.path,
			appName: 'watai'
		});
		
		var config = loader.load(SuiteLoader.paths.config);

		if (! config.baseURL) {
			var msg = 'No baseURL was found in any "' + SuiteLoader.paths.config + '" file in directories above "' + this.path + '"';
			logger.error(msg);
			throw new Error(msg);
		}
		
		this.runner = new Runner(config);
		this.context = vm.createContext(this.buildContext());
		
		fs.readdir(this.path, this.loadAllFiles.bind(this));
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
			driver: this.runner.getDriver()
		}
		
		result[SuiteLoader.contextGlobals.featuresList] = this.features;	// hook to pass instantiated features to this context
		result[SuiteLoader.contextGlobals.widgetsList] = {};	// stays in the managed context, but necessary for features to have a reference to all widgets, since they are evaluated in _this_ context, not their instanciation one…
			
		result[SuiteLoader.contextGlobals.logger] = logger.info; // this has to be passed, for simpler access, but mostly because the `console` module is not automatically loaded
		
		return result;
	},
	
	/** Callback handler after `readdir`ing the test description directory.
	*
	*@param	{Error}	err	An optional error object (to be used as callback).
	*@param	{Array.<String>}	files	Array of file paths to examine.
	*
	*@see	http://nodejs.org/api/fs.html#fs_fs_readdir_path_callback
	*@private
	*/
	loadAllFiles: function loadAllFiles(err, files) {
		if (err) {
			suitesLogger.error('Error while trying to load description files in "' + this.path + '"!', { path: this.path });
			throw err;
		}
		
		var featureFiles = [],
			widgetFiles = [];
		files.forEach(function(file) {
			if (file.contains(SuiteLoader.paths.dataMarker))
				this.loadData(this.path + file);
			else if (file.contains(SuiteLoader.paths.widgetMarker))
				widgetFiles.push(this.path + file);	// don't load them immediately in order to make referenced data values available first
			else if (file.contains(SuiteLoader.paths.featureMarker))
				featureFiles.push(this.path + file);	// don't load them immediately in order to make referenced widgets available first
		}, this);
		
		widgetFiles.forEach(this.loadWidget.bind(this));		
		featureFiles.forEach(this.loadFeature.bind(this));
	},
	
	/** Loads the given definitions globally into this Loader's managed namespace.
	*
	*@param	dataFile	Path to a data description file. This is simply a list of variable definitions.
	*@returns	{SuiteLoader}	This SuiteLoader, for chaining.
	*
	*@see	#loadAllFiles
	*/
	loadData: function loadData(dataFile) {
		logger.verbose('~ loading ' + dataFile);
		
		try {
			vm.runInContext(fs.readFileSync(dataFile),
							this.context,
							dataFile);
		} catch (error) {
			suitesLogger.error('**Error in file "' + dataFile + '"**', { path : dataFile });
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
		logger.verbose('- loading ' + widgetFile);
		
		var widgetName = pathsUtils.basename(widgetFile, '.js');
		
		try {
			vm.runInContext(widgetName + ' = '
							+ '__widgets__["' + widgetName + '"] = '
							+ 'new Widget("' + widgetName + '",'
							+ fs.readFileSync(widgetFile) + ','
							+ 'driver);',
							this.context,
							widgetFile);
		} catch (error) {
			suitesLogger.error('**Error in file "' + widgetFile + '"**', { path: widgetFile });
			throw error;
		}
		
		return this;
	},
	
	/** Loads the given file as a feature into this SuiteLoader's underlying runner.
	*
	*@param	featureFile	Path to a feature description file. See examples to see how such a file should be written.
	*@returns	{SuiteLoader}	This SuiteLoader, for chaining.
	*
	*@see	#loadAllFiles
	*/
	loadFeature: function loadFeature(featureFile) {
		logger.verbose('+ loading ' + featureFile);
		
		try {
			vm.runInContext('var featureContents = ' + fs.readFileSync(featureFile) + ';'
							+ '__features__.push(new Feature('
							+								 'featureContents.description,'
							+								 'featureContents.scenario,'
							+								 '__widgets__'
							+ '));',
							this.context,
							featureFile);
		} catch (error) {
			suitesLogger.error('**Error in file "' + featureFile + '"**', { path: featureFile });
			throw error;
		}
		
		this.runner.addFeature(this.features.pop());
		
		return this;
	},
	
	/** Asks the underlying Runner instance to execute all tests.
	*
	*@returns	The executing Runner.
	*/
	run: function run() {
		var underline = '';
		this.name.length.times(function() { underline += '-' });	//TODO: remove trailing slashes from printed names
		suitesLogger.info(this.name);
		suitesLogger.info(underline);
		
		this.runner.run();
		
		return this.runner;
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
	/** If a file contains this string, it is considered as a feature description to be loaded.
	*/
	featureMarker:	'Feature.js',
	/** If a file contains this string, it is considered as a widget description to be loaded.
	*/
	widgetMarker:	'Widget.js',
	/** If a file contains this string, it is considered as a data suite to be loaded.
	*/
	dataMarker:		'Data.js'
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
	logger:			'log'
}


module.exports = SuiteLoader;	// CommonJS export
