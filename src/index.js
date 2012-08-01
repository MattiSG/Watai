/* Here is the main CLI entry point.
*/
var args = process.argv.slice(2); // extract CLI arguments, see http://docs.nodejitsu.com/articles/command-line/how-to-parse-command-line-arguments


/** Absolute path to the main library file.
*/
var MAIN_FILE = exports.MAIN_FILE = require('path').join(__dirname, 'TestRight.js');


if (args.length == 0) {
	showHelp();
	process.exit(2);
} else if (args[0] == '--installed') {
	var evaluation = isInstalled();

	if (evaluation === true) {
		console.log('Watai seems to be installed properly  :)  Now get testing!');
		process.exit(0);
	} else {
		console.error('**Watai has not been installed properly, please make sure you followed all installation instructions.**');
		console.error('Main reason: ' + evaluation.message + '.');
		console.error('See http://github.com/MattiSG/Watai for details.');
		process.exit(1);
	}
} else {
	main(args);
}

/** The CLI takes paths to test description folders as arguments.
* Any number of paths may be given.
*
*@param	{Array.<String>}	folders	This **function**, as opposed to the CLI, takes in an array of paths. The CLI takes varargs.
*@see	SuiteLoader
*@private
*/
function main(folders) {
	var TR = require(MAIN_FILE);

	var suites = new Array(folders.length);
	
	folders.forEach(function(descriptionPath) {
		suites.push(new TR.SuiteLoader(descriptionPath));
	});
	
	suites.forEach(function(suite) {
		suite.run();
	});
}

/** Provides a quick smoke test for proper installation.
*@return	`true` if this software has all its dependencies installed or not, the error that explains what fails otherwise.
*@private
*/
function isInstalled() {
	try {
		require('./TestRight');
		return true;
	} catch (e) {
		return e;
	}
}

/** Prints CLI synopsis.
*@private
*/
function showHelp() {
	var logger = require('winston').loggers.get('suites');

	logger.error("Oops, you didn’t provide any test suite to execute!");
	logger.info("Usage: watai path/to/suite/description/folder [another/suite [yetAnother […]]]");
}
