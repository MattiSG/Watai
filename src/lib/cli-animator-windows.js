/**@namespace A fake animation helper for the Windows console.
* Has much less functionality than the POSIX one, but offers easy compatibility.
*/
var WindowsCLI = {};

var logger = require('winston').loggers.get('suites');


/** Presents the given information to the user.
*@param	{string}	prefix	A symbol to prepend to the message.
*@param	{string}	type	The type of information to present (i.e. "debug", "info", "warn"…).
*@param	{string}	message	The actual content to present to the user.
*@param	{string?}	messageType	The type of the actual content, for different colouration. 
*/
WindowsCLI.log = function log(prefix, type, message, messageType) {
	logger[method](prefix + '  ' + message);
}

/** Hides the cursor.
*/
WindowsCLI.hideCursor = function hideCursor() {
	// do nothing on Windows
}

/** Shows the cursor.
*/
WindowsCLI.showCursor = function showCursor() {
	// do nothing on Windows
}

/** Does a spinner animation with the given message.
*/
WindowsCLI.spin = function spin(message) {
	logger.verbose(message);
}

module.exports = WindowsCLI;	// CommonJS export
