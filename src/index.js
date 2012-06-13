var TR = require('./TestRight');


// =========================== //
// =========== CLI =========== //
// =========================== //

var args = process.argv.slice(2); // extract CLI arguments, see http://docs.nodejitsu.com/articles/command-line/how-to-parse-command-line-arguments

if (args.length == 0) {
	showHelp();
	return 2;
}

main(args);

// =========================== //
// =========== /CLI ========== //
// =========================== //



/** The CLI takes paths to test description folders as arguments.
* Any number of paths may be given.
*
*@param	{Array.<String>}	folders	This **function**, as opposed to the CLI, takes in an array of paths. The CLI takes varargs.
*
*@see	SuiteLoader
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
*/
function showHelp() {
	console.log("Usage: " + process.argv[1] + " path/to/description/folder [another [yetAnother […]]]");
}
