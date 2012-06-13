var fs = require('fs'),
	pathsUtils = require('path'),
	vm = require('vm');

var Widget = require('../model/Widget'),
	Feature = require('../model/Feature'),
	Runner = require('./Runner');


/**@class A SuiteLoader handles all test description files loading and Runner setup.
* A test description folder should contain a `config.js` file, and any number of feature (`*Feature.js`) and widget (`*Widget.js`) description files.
*
* Features will be loaded in an internally-managed Runner, and Widgets will be made available in the global namespace.
*
* _Since we're currently in high-speed iterative development, hence without formal documentation, see the `example` folder for more information on how to write such files._
*/
var SuiteLoader = new Class({
	/** Defines all naming patterns conventions for test description folders.
	* Used for magical autoload.
	*
	*@constant
	*/
	paths: {
		/** Exact name of configuration files to look for in description folders.
		*/
		config: 'config.js',
		/** If a file contains this string, it is considered as a feature description to be loaded.
		*/
		featureMarker:	'Feature.js',
		/** If a file contains this string, it is considered as a widget description to be loaded.
		*/
		widgetMarker:	'Widget.js',
		/** If a file contains this string, it is considered as a data suite to be loaded.
		*/
		dataMarker:		'Data.js'
	},
	
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
	
	features: [],
	
	/** Creates a new `Runner` based on the given configuration, and initiates Widgets and Features parsing.
	*
	*@param	path	Path to the folder containing a test description. Trailing slashes will be normalized, don't worry about them  :)
	*/
	initialize: function init(path) {
		this.path = pathsUtils.resolve(path) + '/';
		
		this.name = pathsUtils.basename(path);
		
		var config;
		try {
			config = require(this.path + this.paths.config);
		} catch (error) {
			console.log('No loadable configuration file (' + this.paths.config + ') in "' + this.path + '"!');
			throw error;
		}
		
		this.runner = new Runner(config);
		this.context = vm.createContext({
			driver: this.runner.getDriver(),
			Widget: Widget,
			Feature: Feature,
			__features__: this.features
		});
		
		fs.readdir(this.path, this.loadAllFiles.bind(this));
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
			console.log('Error while trying to load description files in "' + this.path + '"!');
			throw err;
		}
		
		var featureFiles = [],
			widgetFiles = [];
		files.forEach(function(file) {
			if (file.contains(this.paths.dataMarker))
				this.loadData(this.path + file);
			else if (file.contains(this.paths.widgetMarker))
				widgetFiles.push(this.path + file);	// we don't load them immediately in order to make referenced data values available first
			else if (file.contains(this.paths.featureMarker))
				featureFiles.push(this.path + file);	// we don't load them immediately in order to make referenced widgets available first
		}, this);
		
		widgetFiles.forEach(this.loadWidget.bind(this));		
		featureFiles.forEach(this.loadFeature.bind(this));
	},
	
	loadData: function loadData(dataFile) {
		if (VERBOSE)
			console.log('~ loading ' + dataFile);

		vm.runInContext(fs.readFileSync(dataFile),
						this.context);
						
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
		if (VERBOSE)
			console.log('- loading ' + widgetFile);
		
		var widgetName = pathsUtils.basename(widgetFile, '.js');
		vm.runInContext('var ' + widgetName + ' = '
						+ 'new Widget(' + widgetName + ','
						+ fs.readFileSync(widgetFile) + ','
						+ 'driver)',
						this.context);
		
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
		if (VERBOSE)
			console.log('+ loading ' + featureFile);

		vm.runInContext('var featureContents = ' + fs.readFileSync(featureFile) + ';'
						+ '__features__.push(new Feature('
						+								 'featureContents.description,'
						+								 'featureContents.scenario));',
						this.context);
		
		this.runner.addFeature(this.features.pop());
		
		return this;
	},
	
	/** Asks the underlying Runner instance to execute all tests.
	*
	*@returns	The executing Runner.
	*/
	run: function run() {
		var underline = '';
		this.name.length.times(function() { underline += '-' });
		console.log(this.name + '\n' + underline);
		
		this.runner.run();
		
		return this.runner;
	}
});

module.exports = SuiteLoader;	// CommonJS export
