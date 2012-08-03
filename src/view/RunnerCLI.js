var logger = require('winston').loggers.get('suites');

/** Presents the given information to the user.
*@param	{string}	method	The winston logger method to call (i.e. "debug", "info", "warn"…).
*@param	{string}	prefix	A symbol to prepend to the message.
*@param	{string}	message	The actual content to present to the user.
*@private
*/
function log(prefix, method, message) {
	logger[method](prefix + '  ' + message);
}

exports.beforeRun = function onBeforeRun() {
	log(' ҉', 'info', 'Connecting to browser…')
}

exports.ready = function onReady() {
	log('⦾', 'info', 'Browser ready!')
}

exports.run = function onRun() {
	log('۞', 'info', 'Test started.')
}

/** Presents details of a test success to the user.
*@param	{Feature}	feature	The feature whose results are given.
*/
exports.featureSuccess = function onFeatureSuccess(feature) {
	log('✔', 'info', feature.description);
}

/** Presents details of a test failure to the user.
*@param	{Feature}	feature	The feature whose results are given.
*@param	{Array.<String>}	An array of strings giving details on failures.
*/
exports.featureFailure = function onFeatureFailure(feature, failures) {
	log('✘', 'warn', feature.description);

	failures.forEach(function(failure) {
		log('	', 'debug', failure);
	});
}

/** Presents details of a test error to the user.
*@param	{Feature}	feature	The feature whose results are given.
*@param	{Array.<String>}	An array of strings giving details on errors.
*/
exports.featureError = function onFeatureError(feature, errors) {
	log('⚠', 'error', feature.description);
	
	errors.forEach(function(error) {
		log('	', 'debug', error);
	});
}
