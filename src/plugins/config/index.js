/** Parses an option hash given through the CLI.
*
*@param		{String}	data	A JSON-encoded series of config options.
*@returns	{Hash}		The config options, unserialized.
*/
function parseOptions(data) {
	return JSON.parse(data);
}


module.exports = parseOptions;	// CommonJS export
