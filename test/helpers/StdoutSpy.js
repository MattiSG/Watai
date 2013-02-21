/** Will be set to `true` whenever `process.stdout.write` is called.
*/
var printed = false,
/** Set to `true` to silence calls to `process.stdout.write`.
*/
	suspend = false;


process.stdout.write = (function(write) {
	return function(buf, encoding, fd) {
		if (! suspend)
			write.call(process.stdout, buf, encoding, fd);
		printed = true;
	};
}(process.stdout.write));


/** Resets the "printed" flag.
*
*@see	#didPrint
*/
exports.reset = function reset() {
	printed = false;
}

/** Tells whether `stdout.write` was called since the last call to `reset`.
*
*@returns	{Boolean}
*/
exports.called = function called() {
	return printed;
}

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
