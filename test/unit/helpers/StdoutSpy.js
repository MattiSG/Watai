/** Buffer for data that would have been printed while muted.
*
*@type	{String}
*/
var buffer = '',
/** Set to `true` to silence calls to `process.stdout.write`.
*
*@type	{Boolean}
*/
	suspend = false;


process.stdout.write = (function(write) {
	return function(buf, encoding, fd) {
		if (suspend)
			buffer += buf;
		else
			write.call(process.stdout, buf, encoding, fd);
	};
}(process.stdout.write));


/** Resets the printing buffer.
*
*@see	#called
*/
exports.reset = function reset() {
	buffer = '';
}

/** Returns what would have been printed while muted.
*
*@returns	{String}
*/
exports.printed = function printed() {
	return buffer;
}

/** Tells whether `stdout.write` was called since the last call to `reset`.
*
*@returns	{Boolean}
*/
exports.called = function called() {
	return Boolean(buffer);
};

/** Stops `stdout` output.
*/
exports.mute = function mute() {
	suspend = true;
}

/** Allows `stdout` output.
*/
exports.unmute = function unmute() {
	suspend = false;
}
