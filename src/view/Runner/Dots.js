var ScenarioDotsView = require('../Scenario/Dots');


/**@class An output in dots format for Runner events.
*/
var RunnerDots = new Class({
	Extends: require('../PromiseView'),

	scenarios	: [],
	startTime	: null,
	readyTime	: null,

	events: {
		/** Informs the user that the emitting Runner is ready to start.
		*/
		ready: function onReady() {
			this.readyTime = new Date();
			process.stdout.write('Browser ready\n');
		},

		steps: function onScenario(scenario) {
			this.scenarios.push(new ScenarioDotsView(scenario));
		}
	},

	/** Informs the user that the emitting Runner is waiting for the browser.
	*/
	showStart: function showStart() {
		this.startTime = new Date();
		process.stdout.write(this.model + '\n');
	},

	showFailure: function showFailure(reason) {
		var description = this.getErrorDescription(reason);
		if (description.title) {	// if we can't give more info, simply don't show anything
			console.error(description.title);
			console.error(description.help);
		}
	},

	/** Presents a summary of the test procedure to the user.
	*/
	showEnd: function showEnd() {
		var scenariosCount = this.scenarios.length,
			failuresCount = 0;

		process.stdout.write('\n');

		this.scenarios.each(function(scenario) {
			if (scenario.model.promise.isRejected()) {
				failuresCount++;
				scenario.showFailureDetails();
			}
		});

		var successCount = (scenariosCount - failuresCount);

		process.stdout.write('\nFinished in '
							 + getDurationString(this.startTime, new Date())
							 + ': '
							 + 'scenario'.count(scenariosCount)
							 + ' ('
							 + this.model.config.ignore.length
							 + ' ignored),'
							 + 'success'.count(successCount, 'es')
							 + ', '
							 + 'failure'.count(failuresCount)
							 + '\n');
	}
});


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

	[ 'hour', 'minute', 'second' ].forEach(function(unit) {
		var value = durations[unit];
		if (value > 0)
			result += unit.count(value) + ' ';
	});

	return result.trim();
}

module.exports = RunnerDots;	// CommonJS export
