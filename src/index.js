var Watai			= require('./Watai'),
	/** Path to the directory containing option-callable scripts.
	*@type	{String}
	*@see	#preProcessArguments
	*@private
	*/
	OPTIONS_HANDLERS_DIR = './plugins/';
	showHelpAndExit	= require(OPTIONS_HANDLERS_DIR + 'help'),
	logger			= require('winston');

/*
* Here is the main CLI entry point.
*/

args = preProcessArguments(process.argv);

if (args.length == 0) {
	logger.error('Oops, you didn’t provide any test suite to execute!');
	showHelpAndExit(2);
}

if (args.length > 1) {
	logger.error('Too many arguments! (' + args + ')');
	showHelpAndExit(2);
}


var path	= args[0],
	suite	= new Watai.SuiteLoader(path);

suite.run().then(function() {
	process.exit(0);
}, function(error) {
	process.stderr.write(error);
	process.exit(1);
});


/** Loads plugins based on any passed options.
* More precisely: any option prefixed with `--` will be recognized as a plugin, and if a matching file is found, the corresponding argument will be removed from the passed in array.
* The convention is for such plugins to reside in a `plugins/<plugin_name>/index.js` file, and to export a function that define their expected arguments. The corresponding number of arguments will be popped from the arguments list.
* The loaded plugin function may return an array of values, which will be added in the resulting arguments array.
*
*@return	{Array}	The transformed array of arguments, rid of its options and possibly filled with plugins results.
*@private
*/
function preProcessArguments(args) {
	args = args.slice(2);	// extract CLI arguments, see http://docs.nodejitsu.com/articles/command-line/how-to-parse-command-line-arguments

	var result = [];

	for (var i = 0; i < args.length; i++) {
		var optionMatch = args[i].match(/^--([^-].*)/);

		if (! optionMatch) {	// this is not an option
			result.push(args[i]);	// pass it without doing anything on it
		} else {
			var pluginName = optionMatch[1],	// [1] is the value of the first capturing parentheses
				plugin;

			try {
				plugin = require(OPTIONS_HANDLERS_DIR + pluginName);
			} catch (e) {	// no matching plugin to handle this option
				result.push(args[i]);	// pass it without doing anything on it
				continue;	// go straight to the next option
			}

			var params = args.slice(i + 1, i + 1 + plugin.length);	// extract the required arguments from the CLI
			i += plugin.length;	// update the options pointer: params for this option will be ignored

			var optionResults = plugin.apply(null, params);

			if (optionResults)
				result.push.apply(result, optionResults);	// the potential array of values returned by the plugin to the new arguments array
		}
	}

	return result;
}
