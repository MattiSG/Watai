/** Prints CLI synopsis.
*
*@param	{Number|false}	[exitCode]	The exit code with which the process should exit. Pass `false` to not exit. Defaults to exiting with status code 0.
*/
function showHelp(exitCode) {
	var packageDescription = require('../../../package.json');

	console.log([
		'Usage: watai [--config \'{"json":"hash"}\'] path/to/suite/description/folder',
		'       watai --version',
		'       watai --installed',
		'Get more information at <' + packageDescription.homepage + '>'
	].join('\n'));

	if (typeof exitCode === false)
		return;

	process.exit(exitCode || 0);
}


module.exports = showHelp;	// CommonJS export
