var path = require('path');

/** A parser for arguments that loads “plugins”, i.e. Node modules, based on options passed in UNIX long style (i.e. with two dashes).
*
*@class	Loads plugins based on options passed in UNIX long style.
*/
var Preprocessor = function Preprocessor(pluginsDir) {
	this.pluginsDir = pluginsDir;
}

/** Loads plugins based on arguments passed to the main Node process.
*
*@return	{Hash}	A hash whose keys are the processed plugins, mapped to their result; plus a magic key 'remaining' containing all non-processed args.
*@see		processAll
*/
Preprocessor.prototype.processArgv = function processArgv() {
	var args = process.argv.slice(2);	// extract CLI arguments, see http://docs.nodejitsu.com/articles/command-line/how-to-parse-command-line-arguments

	return this.processAll(args);
}

/** Loads plugins based on any passed options.
* More precisely: any option prefixed with `--` will be recognized as a plugin, and if a matching file is found, the corresponding argument will be removed from the passed in array.
* The convention is for such plugins to reside in a `plugins/<plugin_name>/index.js` file, and to export a function that define their expected arguments. The corresponding number of arguments will be popped from the arguments list.
* The loaded plugin function may return an array of values, which will be added in the resulting arguments array.
*
*@return	{Hash}	A hash whose keys are the processed plugins, mapped to their result; plus a magic key 'remaining' containing all non-processed args.
*/
Preprocessor.prototype.processAll = function processAll(args) {
	var result = {
		remaining: []
	};

	for (var i = 0; i < args.length; i++) {
		var optionMatch = args[i].match(/^--([^-].*)/);

		if (! optionMatch) {	// this is not an option
			result.remaining.push(args[i]);	// pass it without doing anything on it
		} else {
			var pluginName = optionMatch[1],	// [1] is the value of the first capturing parentheses
				plugin;

			try {
				plugin = require(path.join(this.pluginsDir, pluginName));
			} catch (e) {	// no matching plugin to handle this option
				result.remaining.push(args[i]);	// pass it without doing anything on it
				continue;	// go straight to the next option
			}

			var params = args.slice(i + 1, i + 1 + plugin.length);	// extract the required arguments from the CLI
			i += plugin.length;	// update the options pointer: params for this option will be ignored

			try {
				var optionResults = plugin.apply(null, params);
			} catch (err) {
				err.message += ' (when trying to parse option "--' + pluginName + '"';

				if (params.length)
					err.message += ' with params "' + params.join('", "') + '"';

				err.message += ')';

				throw err;
			}

			if (optionResults)
				result[pluginName] = optionResults;
		}
	}

	return result;
}


module.exports = Preprocessor;	// CommonJS export
