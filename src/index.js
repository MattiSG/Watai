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
	OPTIONS_HANDLERS_DIR	= path.join(__dirname, 'plugins');


var argsProcessor = new Preprocessor(OPTIONS_HANDLERS_DIR);

var processedArgs = argsProcessor.process(process.argv);

var args = processedArgs.remaining;

validateParams(args);

var suitePath	= args[0],
	suite		= new Watai.SuiteLoader(suitePath, processedArgs.config),
	statusCode	= 0;

suite.getRunner()
	 .test()
	 .fail(function() {
	 	statusCode = 1;
	 }).end();	// ensure any uncaught exception gets rethrown


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
