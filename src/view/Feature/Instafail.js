/**@namespace	Logs feature failures and errors as they come.
*/
var Instafail = {};

var animator = require('../../../src/lib/cli-animator');

/** Presents details of a test step failure to the user.
*/
Instafail.stepFailure = function onStepFailure(failure, stepIndex) {
	process.stdout.write('   - at step ' + stepIndex + ': ' + failure + '\n');
}


module.exports = Instafail;	// CommonJS export
