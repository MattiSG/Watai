var logger = require('winston').loggers.get('suites');

/**@namespace A command-line interface that outputs and formats a Runner’s events.
*/
var RunnerCLI = {};

process.on('SIGINT', function(){
	showCursor();
	console.log('\n');
	process.exit();
});

/** Hides the cursor.
*@private
*@author	TJ Holowaychuk	(Mocha)
*/
function hideCursor(){
	process.stdout.write('\033[?25l');
}

/** Shows the cursor.
*@private
*@author	TJ Holowaychuk	(Mocha)
*/
function showCursor(){
	process.stdout.write('\033[?25h');
}


function makeLine(prefix, colorCode, message, messageColorCode) {
	messageColorCode = messageColorCode || 0;
	return '\r\033[' + colorCode + 'm' + prefix + ' \033[' + messageColorCode + 'm ' + message + '\033[0m';
}

function makeFrames(msg) {
	return [
		makeLine('◜', 96, msg, 90),
		makeLine('◠', 96, msg, 90),
		makeLine('◝', 96, msg, 90),
		makeLine('◞', 96, msg, 90),
		makeLine('◡', 96, msg, 90),
		makeLine('◟', 96, msg, 90)
	]
}

var typeToColorCode = {
	'debug'	: 34,
	'cyan'	: 36,
	'info'	: 32,
	'error'	: 35,
	'warn'	: 31,
	'yellow': 33
}

/** Presents the given information to the user.
*@param	{string}	method	The winston logger method to call (i.e. "debug", "info", "warn"…).
*@param	{string}	prefix	A symbol to prepend to the message.
*@param	{string}	message	The actual content to present to the user.
*@private
*/
function log(prefix, method, message, messageMethod) {
	stop();
	process.stdout.write(makeLine(prefix, typeToColorCode[method], message + '\n', typeToColorCode[messageMethod]));
}


/** Plays the given array of strings.
*@private
*@author	TJ Holowaychuk	(Mocha)
*/

function play(frames, interval) {
	var len = frames.length,
		interval = interval || 100,
		i = 0;

	play.timer = setInterval(function() {
		var str = frames[i++ % len];
		process.stdout.write('\r' + str);
	}, interval);
}

/**Stop play()ing.
*@private
*@author	TJ Holowaychuk	(Mocha)
*/
function stop() {
	clearInterval(play.timer);
}

/** Informs user that the emitting Runner is waiting for the browser.
*/
RunnerCLI.beforeRun = function onBeforeRun() {
	play(makeFrames('waiting for browser…'));
}

/** Informs user that the emitting Runner is ready to start.
*/
RunnerCLI.ready = function onReady() {
	log(' ҉', 'info', 'Browser ready!            ');
}

/** Presents details of a test start to the user.
*@param	{Feature}	feature	The feature that is about to start.
*/
RunnerCLI.featureStart = function onFeatureStart(feature) {
	play(makeFrames(feature.description));
}

/** Presents details of a test success to the user.
*@param	{Feature}	feature	The feature whose results are given.
*/
RunnerCLI.featureSuccess = function onFeatureSuccess(feature) {
	log('✔', 'info', feature.description);
}

/** Presents details of a test failure to the user.
*@param	{Feature}	feature	The feature whose results are given.
*@param	{Array.<String>}	failures	An array of strings giving details on failures.
*/
RunnerCLI.featureFailure = function onFeatureFailure(feature, failures) {
	log('✘', 'warn', feature.description, 'warn');

	failures.forEach(function(failure) {
		log('   ↳', 'cyan', failure, 'cyan');
	});
}

/** Presents details of a test error to the user.
*@param	{Feature}	feature	The feature whose results are given.
*@param	{Array.<String>}	errors	An array of strings giving details on errors.
*/
RunnerCLI.featureError = function onFeatureError(feature, errors) {
	log('⚠', 'error', feature.description);
	
	errors.forEach(function(error) {
		log('   ↳', 'cyan', error, 'cyan');
		
		if (error.stack)
			log('	', 'verbose', error.stack, 'verbose');
	});
}

module.exports = RunnerCLI;	// CommonJS export
