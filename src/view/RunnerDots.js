/**@namespace An outputs in dots formats for Runner’s events.
*/
var RunnerDots = {};

var failuresAndErrorsBuffer = [];

var failureCounter = 0,
	 	successCounter = 0,
		errorCounter 	 = 0,
		startTime,
		browserReadyTime,
		endTime;

/** Informs user that the emitting Runner is waiting for the browser.
*/
RunnerDots.beforeRun = function onBeforeRun() {
	startTime = new Date();
}

/** Informs user that the emitting Runner is ready to start.
*/
RunnerDots.ready = function onReady() {
	browserReadyTime = new Date();
}

/** Presents details of a test start to the user.
*@param	{Feature}	feature	The feature that is about to start.
*/
RunnerDots.featureStart = function onFeatureStart(feature) {

}

/** Presents a brief summary of a test success to the user.
* Increment the success counter.
*@param	{Feature}	feature	The feature whose results are given.
*/
RunnerDots.featureSuccess = function onFeatureSuccess(feature) {
	process.stdout.write('.');
	successCounter++;
}

/** Presents a brief summary of a test failure to the user
* Increment the failure counter.
*/
RunnerDots.featureFailure = function onFeatureFailure(feature, failures) {
	process.stdout.write('F');
	failureCounter++;

	var results = '';

	failures.forEach(function(failure) {
		results += failure + '\n';
		results += '\n\n';
	});

	failuresAndErrorsBuffer.push(results);
}

/** Presents details of a test error to the user.
* Increment the error counter.
*/
RunnerDots.featureError = function onFeatureError(feature, errors) {
	process.stdout.write('E');
	errorCounter++;

	var results = '';

	errors.forEach(function(error) {
		results += failure + '\n';
		if (error.stack) {
			results += error.stack + '\n';
		}
		results += '\n\n';
	});

	failuresAndErrorsBuffer.push(results);
}

/** Presents a summary of the test procedure to the user when some tests failed or have errors.
*/
RunnerDots.failure = function failure(failures) {
	endTime = new Date();

	failuresAndErrorsBuffer.forEach(function(failure) {
		process.stdout.write('\n\n✘ ' + failure);
	});

	process.stdout.write('\n\nFinished in ' + getDurationString(startTime, endTime) + ': ' + getTotalNumberOfTest() + ' examples, ' + successCounter + ' success, ' + pluralize(failureCounter, 'failure')  + ', ' + pluralize(errorCounter, 'error') + '\n\n');
}

/** Presents a summary of the test procedure to the user when all tests passed.
*/
RunnerDots.success = function success() {
	endTime = new Date();

	process.stdout.write('\n\nFinished in ' + getDurationString(startTime, endTime) + ': ' + getTotalNumberOfTest() + ' examples, 0 failures\n\n');
}

/** Returns the total number of test.
*@returns {Number} total number of test.
*@private
*/
var getTotalNumberOfTest = function getTotalNumberOfTest() {
	return successCounter + errorCounter + failureCounter;
}

/** Returns the string pluralized according to the count.
*@param {Number} count	The number used to pluralize the string.
*@returns {String} string	The string to pluralize based on the count.
*@private
*/
var pluralize = function pluralize(count, string) {
	return count + ' ' + string + (count == 1 ? '' : 's');
}

/** Returns the string duration between two dates
*@param {Number} start	The start date
*@returns {String} end	The end date
*@private
*/
var getDurationString = function getDurationString(start, end) {
	var results = "",
			diffHours = Math.floor((end - start) / 3600 / 1000),
			diffMinutes = Math.floor((end - start) / 60 / 1000),
			diffSeconds = Math.floor((end - start) / 1000);

	results += diffHours > 0 ? pluralize(diffHours, 'hour') + ' ' : '';
	results += diffMinutes > 0 ? pluralize(diffMinutes, 'minute') + ' ' : '';
	results += diffSeconds > 0 ? pluralize(diffSeconds, 'second') + ' ' : '';
	return results.substring(0, results.length - 1); // Remove the last space
}

module.exports = RunnerDots;	// CommonJS export
