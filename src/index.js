var promises = require('q');


/* Here is the main CLI entry point.
*/
var args = process.argv.slice(2); // extract CLI arguments, see http://docs.nodejitsu.com/articles/command-line/how-to-parse-command-line-arguments

/** Absolute path to the main library file.
*@type	{String}
*/
var MAIN_FILE = exports.MAIN_FILE = require('path').join(__dirname, 'Watai.js');

/** Path to the directory containing option-callable scripts.
*@type	{String}
*@see	#preProcessArguments
*@private
*/
var LOAD_OPTIONS_FROM = './plugins/';


if (args.length == 0) {
	var logger = require('winston'),
		showHelpAndExit = require(LOAD_OPTIONS_FROM + 'help');

	logger.error("Oops, you didn’t provide any test suite to execute!");

	showHelpAndExit(2);
}

var Watai = require(MAIN_FILE);

args = preProcessArguments(args);

main(args);


/** Loads plugins based on any passed options.
* More precisely: any option prefixed with `--` will be recognized as a plugin, and if a matching file is found, the corresponding argument will be removed from the passed in array.
* The convention is for such plugins to reside in a `plugins/<plugin_name>/index.js` file, and to export a function that define their expected arguments. The corresponding number of arguments will be popped from the arguments list.
* The loaded plugin function may return an array of values, which will be added in the resulting arguments array.
*
*@return	{Array}	The transformed array of arguments, rid of its options and possibly filled with plugins results.
*@private
*/
function preProcessArguments(args) {
	var result = [];

	for (var i = 0; i < args.length; i++) {
		var optionMatch = args[i].match(/^--([^-].*)/);

		if (! optionMatch) {	// this is not an option
			result.push(args[i]);	// pass it without doing anything on it
		} else {
			var pluginName = optionMatch[1],	// [1] is the value of the first capturing parentheses
				plugin;

			try {
				plugin = require(LOAD_OPTIONS_FROM + pluginName);
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

/** The CLI takes paths to test description folders as arguments.
* Any number of paths may be given.
*
*@param	{Array.<String>}	folders	This **function**, as opposed to the CLI, takes in an array of paths. The CLI takes varargs.
*@see	SuiteLoader
*@private
*/
function main(folders) {
	var suites = [];

	folders.forEach(function(descriptionPath) {
		suites.push(new Watai.SuiteLoader(descriptionPath));
	});

	var suitePromises = suites.map(function(suite) {
		return suite.run();
	});

	promises.allResolved(suitePromises)
			.then(exit, function(error) {	// rejecting those promises is an interal Q.js error
				process.stderr.write(error);
				process.exit(3);
			});
}

/** Exits the process with the proper status code.
*
*@param	{Array.<Promise>}	The array of suite runs promises, all resolved.
*/
function exit(promises) {
	promises.forEach(function(promise) {
		if (! promise.isFulfilled())
			process.exit(1);
	});

	process.exit(0);
}
