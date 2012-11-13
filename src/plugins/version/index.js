/** Presents the user with a message telling if this software passes a quick smoke test, and gives the main reason if not.
* Exits the running process afterwards.
*/
function tellUserCurrentVersion() {
	var packageDescription = require('../../../package.json');

	console.log(packageDescription.name
				+ ' version '
				+ packageDescription.version
				+ '\n'
				+ 'Get more information at <'
				+ packageDescription.homepage
				+ '>');

	process.exit(0);
}


module.exports = tellUserCurrentVersion;	// CommonJS export
