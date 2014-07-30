/** A fake animation helper for the Windows console.
* Has much less functionality than the POSIX one, but offers easy compatibility.
*
* @namespace
*/
var WindowsCLI = {};

var logger = require('winston');


/** Presents the given information to the user.
*@param	{String}	prefix			A symbol to prepend to the message.
*@param	{String}	type			The type of information to present (i.e. "debug", "info", "warn"…).
*@param	{String}	message			The actual content to present to the user.
*@param	{String}	[messageType]	The type of the actual content, for different colouration.
*/
WindowsCLI.log = function log(prefix, type, message, messageType) {
	logger[method](prefix + '  ' + message);
}

/** Erases the current line.
*/
WindowsCLI.clear = function clear() {
	process.stdout.write('\r');
}

/** Hides the cursor.
* Does nothing on Windows.
*/
WindowsCLI.hideCursor = function hideCursor() {
	// do nothing on Windows
}

/** Shows the cursor.
* Does nothing on Windows.
*/
WindowsCLI.showCursor = function showCursor() {
	// do nothing on Windows
}

/** Logs the given message.
*/
WindowsCLI.spin = function spin(message) {
	logger.verbose(message);
}

module.exports = WindowsCLI;	// CommonJS export
