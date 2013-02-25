var FeatureDotsView = require('../Feature/Dots');


/**@class An output in dots format for Runner events.
*/
var RunnerDots = new Class({
	Extends: require('../PromiseView'),

	features	: [],
	startTime	: null,
	readyTime	: null,

	events: {
		/** Informs the user that the emitting Runner is waiting for the browser.
		*/
		driverInit: function onDriverInit() {
			this.startTime = new Date();
			process.stdout.write(this.model + '\n');
		},

		/** Informs the user that the emitting Runner is ready to start.
		*/
		ready: function onReady() {
			this.readyTime = new Date();
			process.stdout.write('Browser ready\n');
		},

		feature: function onFeature(feature) {
			this.features.push(new FeatureDotsView(feature));
		}
	},

	/** Presents a summary of the test procedure to the user.
	*/
	showEnd: function showEnd() {
		var featuresCount = this.features.length,
			failuresCount = 0;

		process.stdout.write('\n');

		this.features.each(function(feature) {
			if (feature.model.promise.isRejected()) {
				failuresCount++;
				feature.showFailureDetails();
			}
		});

		var successCount = (featuresCount - failuresCount);

		process.stdout.write('\nFinished in '
							 + getDurationString(this.startTime, new Date())
							 + ': '
							 + pluralize(featuresCount, 'failure')
							 + ', '
							 + successCount + ' success' + (successCount > 1 ? 'es' : '')
							 + ', '
							 + pluralize(failuresCount, 'failure')
							 + '\n');
	}
});


/** Displays an amount, postfixed with an 's' if needed.
*
*@param {Number} count	The number used to pluralize the string.
*@returns {String} string	The string to pluralize based on the count.
*@private
*/
var pluralize = function pluralize(count, string) {
	return count + ' ' + string + (count == 1 ? '' : 's');
}


/** Computes the duration between two dates.
* The order of the two dates does not matter, a duration is always positive
*
*@param {Date} first	The first date.
*@param {Date} second	The other date.
*@returns {String} A human-readable duration string, of the form "h hours m minutes s seconds".
*@private
*/
var getDurationString = function getDurationString(first, second) {
	var result = '',
		durationSeconds = Math.abs(second - first) / 1000,
		durations = {
			hour	: Math.floor(durationSeconds / 3600),
			minute	: Math.floor(durationSeconds / 60) % 60,
			second	: Math.floor(durationSeconds) % 60
		};	// don't you remove this semicolon

	['hour', 'minute', 'second'].forEach(function(unit) {
		var value = durations[unit];
		if (value > 0)
			result += pluralize(value, unit) + ' ';
	});

	return result.trim();
}

module.exports = RunnerDots;	// CommonJS export
