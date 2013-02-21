var promises = require('q');

var stateMatchers = require('./state');


var StateStep = new Class({
	Extends: require('./AbstractStep'),

	widgets: {},

	matchers: [],

	/**
	*@param	{Function}	action	A function, promise-returning or not, to be executed. If it throws, or returns a rejected promise, this step will fail. Otherwise, it will succeed.
	*/
	initialize: function init(hooksVals, widgets) {
		if (hooksVals.hasOwnProperty('timeout')) {
			this.timeout = hooksVals.timeout;
			delete hooksVals.timeout;	// we don't want to iterate over this property!
		}

		this.widgets = widgets;

		Object.each(hooksVals, function(expected, attribute) {
			// unfortunately, we can't cache elements, since WebDriverJS matches elements to the current page once and for all. We'll have to ask access on the page on which the assertion will take place.
			if (! Object.hasPropertyPath(widgets, attribute))	// the user referenced a non-existing element
				throw new ReferenceError('Could not find "' + attribute + '" in available widgets. Are you sure you spelled the property path properly?');

			if (! Object.hasGetter(widgets, attribute))	// the user referenced a magically-added attribute, not an element
				throw new ReferenceError('"' + attribute + '" is a shortcut, not an element. It can not be used in an assertion description. You should target a key referenced in the `elements` hash of the "' + attribute.split('.')[0] + '" widget.');
		}, this);

		Object.each(hooksVals, function(expected, elementSelector) {
			this.matchers.push(this.prepareStateDescriptorMatchers(elementSelector, expected));
		}, this);
	},

	start: function start() {
		promises.all(this.matchers)
				.then(
					this.succeed.bind(this),
					this.fail.bind(this)
				).end();
	},

	/**
	*@param		elementSelector	The widget element whose content is to be evaluated.
	*@param		expected		The expected value for the element content. This is currently a String, but could change when new matchers are added.
	*@returns	{Function}		A promise-returning function.
	*@private
	*/
	prepareStateDescriptorMatchers: function prepareStateDescriptorMatchers(elementSelector, expected) {
		var activeMatchers	= [],
			failures		= [],
			deferred		= promises.defer();

		stateMatchers.allFor(expected).each(function(matcherClass) {
			activeMatchers.push(new matcherClass(expected, elementSelector, this.widgets));
		}, this);

		if (activeMatchers.length <= 0)
			throw new TypeError('No matcher found for the given value type  :-/  (had to check for "' + expected + '").');

		var matchersLeft = activeMatchers.length;

		function finish() {
			activeMatchers.each(function(matcher) {	// first we need to make sure no failed matcher is going to try again to match even after another ended the evaluation
				matcher.cancel();
			});

			if (matchersLeft <= 0)
				deferred.reject(failures);
			else
				deferred.resolve();
		}

		function handleFailure(message) {
			failures.push(message);

			if (--matchersLeft <= 0)
				finish();
		}

		return function evaluateStateDescriptorMatchers() {
			this.emit('matcher', matcher);

			activeMatchers.each(function(matcher) {
				matcher.test(timeout)
					   .then(finish, handleFailure)
					   .end();	// rethrow any exception
			});

			return deferred.promise;
		}.bind(this);
	}
});


module.exports = StateStep;	// CommonJS export
