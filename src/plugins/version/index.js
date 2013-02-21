/** Presents the user with the current installed version.
* Exits the running process afterwards.
*/
function tellUserCurrentVersion() {
	var packageDescription = require('../../../package.json');

	console.log(packageDescription.version);

	process.exit(0);
}


module.exports = tellUserCurrentVersion;	// CommonJS export
