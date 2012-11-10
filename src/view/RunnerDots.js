/**@namespace An outputs in dots formats for Runner’s events.
*/
var RunnerDots = {};

var failuresAndErrorsBuffer = [],
	failureCounter	= 0,
	successCounter	= 0,
	errorCounter	= 0,
	startTime,
	browserReadyTime;

/** Informs the user that the emitting Runner is waiting for the browser.
*/
RunnerDots.beforeRun = function onBeforeRun() {
	startTime = new Date();
}

/** Informs the user that the emitting Runner is ready to start.
*/
RunnerDots.ready = function onReady() {
	browserReadyTime = new Date();
	process.stdout.write('Browser ready!\n');
}

/** Presents a brief summary of a test success to the user.
*@param	{Feature}	feature	The feature whose results are given.
*/
RunnerDots.featureSuccess = function onFeatureSuccess(feature) {
	process.stdout.write('.');
	successCounter++;
}

/** Presents a brief summary of a test failure to the user.
* Stores the detailed failure description in the main buffer.
*/
RunnerDots.featureFailure = function onFeatureFailure(feature, failures) {
	process.stdout.write('F');
	failureCounter++;

	var failuresDescription = '';

	failures.forEach(function(failure) {
		failuresDescription += failure + '\n\n\n';
	});

	failuresAndErrorsBuffer.push(failuresDescription);
}

/** Presents details of a test error to the user.
* Stores the detailed error description in the main buffer.
*/
RunnerDots.featureError = function onFeatureError(feature, errors) {
	process.stdout.write('!');
	errorCounter++;

	var errorsDescription = '';

	errors.forEach(function(error) {
		errorsDescription += error + '\n';
		if (error.stack) {
			errorsDescription += error.stack + '\n';
		}
		errorsDescription += '\n\n';
	});

	failuresAndErrorsBuffer.push(errorsDescription);
}

/** Presents a summary of the test procedure to the user.
*@private
*/
var showEndReport = function showEndReport() {
	failuresAndErrorsBuffer.forEach(function(failure) {
		process.stdout.write(failure);
	});

	process.stdout.write('\n\nFinished in '
						 + getDurationString(startTime, new Date())
						 + ': '
						 + getTotalNumberOfTest()
						 + ' features, '
						 + successCounter
						 + ' success, '
						 + pluralize(failureCounter, 'failure')
						 + ', '
						 + pluralize(errorCounter, 'error')
						 + '\n\n');
}

/** Presents a summary of the test procedure to the user.
*/
RunnerDots.failure = showEndReport;

/** Presents a summary of the test procedure to the user.
*/
RunnerDots.success = showEndReport;

/**
*@returns {Number} total number of tests.
*@private
*/
var getTotalNumberOfTest = function getTotalNumberOfTest() {
	return successCounter + errorCounter + failureCounter;
}

/** Displays an amount, postfixed with an 's' if needed.
*@param {Number} count	The number used to pluralize the string.
*@returns {String} string	The string to pluralize based on the count.
*@private
*/
var pluralize = function pluralize(count, string) {
	return count + ' ' + string + (count == 1 ? '' : 's');
}


/** Computes the duration between two dates.
* The order of the two dates does not matter, a duration is always positive
*@param {Date} first	The first date.
*@param {Date} second	The other date.
*@returns {String} A human-readable duration string, of the form "h hours m minutes s seconds".
*@private
*/
var getDurationString = function getDurationString(first, second) {
	var result = '',
		durationSeconds = Math.abs(second - first) / 1000;

	var durations = {
		hour:	Math.floor(durationSeconds / 3600),
		minute:	Math.floor(durationSeconds / 60) % 60,
		second:	Math.floor(durationSeconds) % 60
	};	// don't you remove this semicolon

	['hour', 'minute', 'second'].forEach(function(unit) {
		var value = durations[unit];
		if (value > 0)
			result += pluralize(value, unit) + ' ';
	});

	return result.trim();
}

module.exports = RunnerDots;	// CommonJS export
