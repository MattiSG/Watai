var fs = require('fs'),
	pathsUtils = require('path');

var TR = require('../TestRight')();


/**@class A SuiteLoader handles all test description files loading and Runner setup.
* A test description folder should contain a `config.js` file, and any number of feature (`*Feature.js`) and widget (`*Widget.js`) description files.
*
* _Since we're currently in high-speed iterative development, hence without formal documentation, see the `example` folder for more information on how to write such files._
*/
var SuiteLoader = new Class({
	/** Defines all naming patterns conventions for test description folders.
	* Used for magical autoload.
	*/
	paths: {
		/** Exact name of configuration files to look for in description folders.
		*/
		config: 'config.js',
		/** If a file contains this string, it is considered as a feature description to be loaded.
		*/
		featureMarker: 'Feature.js',
		/** If a file contains this string, it is considered as a widget description to be loaded.
		*/
		widgetMarker: 'Widget.js'
	},
	
	/** Will be set to the name of the loaded test suite.
	*/
	name: '',
	
	
	/**
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
		
		this.runner = new TR.Runner(config);
		
		fs.readdir(this.path, this.loadAllFiles.bind(this));
	},
	
	/**
	*@param	err	An optional error object (to be used as callback).
	*@param	files	Array of files to examine.
	*
	*@see	http://nodejs.org/api/fs.html#fs_fs_readdir_path_callback
	*/
	loadAllFiles: function loadAllFiles(err, files) {
		if (err) {
			console.log('Error while trying to load description files in "' + this.path + '"!');
			throw err;
		}
		
		var featureFiles = []; 
		files.forEach(function(file) {
			if (file.contains(this.paths.featureMarker))
				featureFiles.push(this.path + file);
			else if (file.contains(this.paths.widgetMarker))
				this.loadWidget(this.path + file);
		}, this);
		
		featureFiles.forEach(this.loadFeature.bind(this));
	},
	
	/**
	*@param	featureFile	Path to a feature description file. See examples to see how such a file should be written.
	*
	*@see	#loadAllFiles
	*/
	loadFeature: function loadFeature(featureFile) {
		if (VERBOSE)
			console.log('+ loaded ' + featureFile)
		this.runner.addFeature(require(featureFile)(TR, this.runner.getDriver()));
	},
	
	/**
	*@param	widgetFile	Path to a widget description file. See examples to see how such a file should be written.
	*
	*@see	#loadAllFiles
	*/
	loadWidget: function loadWidget(widgetFile) {
		if (VERBOSE)
			console.log('- loaded ' + widgetFile);
		GLOBAL[pathsUtils.basename(widgetFile, '.js')] = require(widgetFile)(TR, this.runner.getDriver());
	},
	
	/** Asks the underlying Runner instance to execute all tests.
	*/
	run: function run() {
		var underline = '';
		this.name.length.times(function() { underline += '-' });
		console.log(this.name + '\n' + underline);
		
		this.runner.run();
	}
});

module.exports = SuiteLoader;
