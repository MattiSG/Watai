var TR = require('./TestRight')();


/** The main execution script takes paths to test description folders.
*
*@see	DescriptionLoader
*/
var args = process.argv.slice(2); // extract CLI arguments, see http://docs.nodejitsu.com/articles/command-line/how-to-parse-command-line-arguments

if (args.length == 0) {
	showHelp();
	return 2;
}

var suites = new Array(args.length);

args.forEach(function(descriptionPath) {
	suites.push(new TR.SuiteLoader(descriptionPath));
});

suites.forEach(function(suite) {
	suite.run();
});


function showHelp() {
	console.log("Usage: " + process.argv[1] + " path/to/description/folder [another [yetAnother […]]]");
}
