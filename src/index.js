var TR = require('./TestRight');

var logger = require('winston').loggers.get('suites');

// =========================== //
// =========== CLI =========== //
// =========================== //

var args = process.argv.slice(2); // extract CLI arguments, see http://docs.nodejitsu.com/articles/command-line/how-to-parse-command-line-arguments

if (args.length == 0) {
	showHelp();
	process.exit(2);
}

main(args);

// =========================== //
// =========== /CLI ========== //
// =========================== //



/** The CLI takes paths to test description folders as arguments.
* Any number of paths may be given.
*
*@param	{Array.<String>}	folders	This **function**, as opposed to the CLI, takes in an array of paths. The CLI takes varargs.
*@see	SuiteLoader
*@private
*/
function main(folders) {
	var suites = new Array(folders.length);
	
	folders.forEach(function(descriptionPath) {
		suites.push(new TR.SuiteLoader(descriptionPath));
	});
	
	suites.forEach(function(suite) {
		suite.run();
	});
}

/** Prints CLI synopsis.
*@private
*/
function showHelp() {
	logger.error("Oops, you didn’t provide any test suite to execute!");
	logger.info("Usage: watai path/to/suite/description/folder [another/suite [yetAnother […]]]");
}
