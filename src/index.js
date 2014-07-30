#!/usr/bin/env node

/*
* Here is the main CLI entry point.
*/

var path = require('path');


var logger	= require('winston');


var Watai					= require('./Watai'),
	Preprocessor			= require('./lib/Preprocessor'),
	/** Path to the directory containing option-callable scripts.
	*@type	{String}
	*@see	preProcessArguments
	*@private
	*/
	OPTIONS_HANDLERS_DIR	= path.join(__dirname, 'plugins'),
	ERRORS_LIST				= require('./errors');


var argsProcessor = new Preprocessor(OPTIONS_HANDLERS_DIR);

var args = argsProcessor.processArgv();

var suites = args.remaining;

validateParams(suites);

if (args.setup)
	Watai.setup.reload(args.setup);


var suitePath	= suites[0],
	suite		= new Watai.SuiteLoader(suitePath, args.config),
	statusCode	= 0;

suite.getRunner()
	.then(function(runner) {
		return runner.test();
	}, function(err) {
		var logger = require('winston').loggers.get('load');
		logger.debug(err.stack);

		var errorDescription = ERRORS_LIST[err && err.code];
		if (errorDescription) {
			logger.error(errorDescription.title);
			logger.info(errorDescription.help);
		}
		throw err;
	}).fail(function(err) {
		var error = ERRORS_LIST[err && err.code] || { exitCode: 1 };
		statusCode = error.exitCode;
		if (err.stack)	// TODO: improve detection of what is an actual uncaught exception (We currently have an ambiguity: is the promise rejected because the test failed or because an error occurred? If error, we should tell the user. This is (badly) approximated by the reason for rejection having a stack trace or not.)
			console.error(err.stack);
	}).done();	// ensure any uncaught exception gets rethrown


process.on('exit', function() {
	process.exit(statusCode);
});



function validateParams(params) {
	var showHelpAndExit = require(path.join(OPTIONS_HANDLERS_DIR, 'help'));

	if (params.length == 0) {
		logger.error('Oops, you didn’t provide any test suite to execute!');
		showHelpAndExit(2);
	}

	if (params.length > 1) {
		logger.error('Too many arguments! (' + params + ')');
		showHelpAndExit(2);
	}
}
