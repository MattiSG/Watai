/** Provides a quick smoke test for proper installation.
*@return	`true` if this software has all its dependencies installed or not, the error that explains what fails otherwise.
*@private
*/
function isInstalled() {
	try {
		require('../../');
		return true;
	} catch (e) {
		return e;
	}
}


/** Presents the user with a message telling if this software passes a quick smoke test, and gives the main reason if not.
* Exits the running process afterwards, with `0` if installed properly or nonzero otherwise.
*/
function tellUserInstallationStatus() {
	var evaluation = isInstalled();

	if (evaluation === true) {
		console.log('Watai seems to be installed properly  :)  Now get testing!');
		process.exit(0);
	} else {
		console.error('**Watai has not been installed properly, please make sure you followed all installation instructions.**');
		console.error('Main reason: ' + evaluation.message + '.');
		console.error('See http://github.com/MattiSG/Watai for details.');
		process.exit(1);
	}
}


module.exports = tellUserInstallationStatus;	// CommonJS export
