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
	*@see	#preProcessArguments
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
	 }).fail(function(err) {
	 	var error = ERRORS_LIST[err && err.code] || { code: 1 };
	 	statusCode = error.code;
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
