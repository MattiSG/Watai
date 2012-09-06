/**@namespace A helper to ease CLI animation.
* Most of this code is extracted from TJ Holowaychuk’s Mocha.
*/
var CLIanimator = {};


process.on('SIGINT', function() {
	CLIanimator.showCursor();
	process.stdout.write('\n');
	process.exit();
});

/** Presents the given information to the user.
*@param	{string}	prefix	A symbol to prepend to the message.
*@param	{string}	type	The type of information to present (i.e. "debug", "info", "warn"…).
*@param	{string}	message	The actual content to present to the user.
*@param	{string?}	messageType	The type of the actual content, for different colouration. 
*/
CLIanimator.log = function log(prefix, type, message, messageType) {
	stop();
	process.stdout.write(makeLine(prefix, typeToColorCode[type], message + '\n', typeToColorCode[messageType]));
}

/** Hides the cursor.
*/
CLIanimator.hideCursor = function hideCursor() {
	process.stdout.write('\033[?25l');
}

/** Shows the cursor.
*/
CLIanimator.showCursor = function showCursor() {
	process.stdout.write('\033[?25h');
}

/** Does a spinner animation with the given message.
*/
CLIanimator.spin = function spin(message) {
	play(makeFrames(message));
}

/** Creates a coloured line out of the given pieces.
*@return	String
*@private
*/
function makeLine(prefix, colorCode, message, messageColorCode) {
	messageColorCode = messageColorCode || 0;
	return '\r\033[' + colorCode + 'm' + prefix + ' \033[' + messageColorCode + 'm ' + message + '\033[0m';
}

/** Generates a series of line “frames” to be played with a spinner animation.
*@return	Array<String>
*@private
*/
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

/** Maps types to the corresponding ANSI color code.
*@type	{Object.<String, Number>}
*@private
*/
var typeToColorCode = {
	'debug'	: 34,
	'cyan'	: 36,
	'info'	: 32,
	'error'	: 35,
	'warn'	: 31,
	'yellow': 33
}

/** Plays the given array of strings.
*@private
*@author	TJ Holowaychuk	(Mocha)
*/

function play(frames, interval) {
	CLIanimator.hideCursor();

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
	CLIanimator.showCursor();
}

module.exports = CLIanimator;	// CommonJS export
