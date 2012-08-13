var logger = require('winston').loggers.get('suites');

process.on('SIGINT', function(){
	showCursor();
	console.log('\n');
	process.exit();
});

/**
 * Hide the cursor.
 */
function hideCursor(){
	process.stdout.write('\033[?25l');
}

/**
 * Show the cursor.
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


/**
 * Play the given array of strings.
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
/**
 * Stop play()ing.
 */

function stop() {
	clearInterval(play.timer);
}

exports.beforeRun = function onBeforeRun() {
	play(makeFrames('waiting for browser…'));
}

exports.ready = function onReady() {
	log(' ҉', 'info', 'Browser ready!            ');
}

/** Presents details of a test start to the user.
*@param	{Feature}	feature	The feature that is about to start.
*/
exports.featureStart = function onFeatureStart(feature) {
	play(makeFrames(feature.description));
}

/** Presents details of a test success to the user.
*@param	{Feature}	feature	The feature whose results are given.
*/
exports.featureSuccess = function onFeatureSuccess(feature) {
	log('✔', 'info', feature.description);
}

/** Presents details of a test failure to the user.
*@param	{Feature}	feature	The feature whose results are given.
*@param	{Array.<String>}	An array of strings giving details on failures.
*/
exports.featureFailure = function onFeatureFailure(feature, failures) {
	log('✘', 'warn', feature.description, 'warn');

	failures.forEach(function(failure) {
		log('   ↳', 'cyan', failure, 'cyan');
	});
}

/** Presents details of a test error to the user.
*@param	{Feature}	feature	The feature whose results are given.
*@param	{Array.<String>}	An array of strings giving details on errors.
*/
exports.featureError = function onFeatureError(feature, errors) {
	log('⚠', 'error', feature.description);
	
	errors.forEach(function(error) {
		log('   ↳', 'cyan', error, 'cyan');
		
		if (error.stack)
			log('	', 'verbose', error.stack, 'verbose');
	});
}
