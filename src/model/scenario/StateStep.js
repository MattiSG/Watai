var promises = require('q');

var stateMatchers = require('./state');


var StateStep = new Class(/** @lends state.StateStep# */{
	Extends: require('./AbstractStep'),

	/** The dictionary of all widgets within which the given state assertion should be understood.
	*
	*@type	{Hash.<String, Widget>}
	*@private
	*/
	widgets: {},

	/** The original, user-provided state description hash.
	*
	*@type	{Hash.<String, ?>}
	*@private
	*/
	descriptors: {},

	/** The assertions corresponding to the given description hash.
	*
	*@type	{Array.<Function>}	An array of promise-returning functions.
	*@private
	*/
	assertions: [],

	/**
	*
	*@param	{Hash.<String, ?>}		description	A state assertion hash.
	*@param	{Hash.<String, Widget>}	widgets		The dictionary of all widgets within which the given state assertion should be understood.
	*@constructs
	*/
	initialize: function init(description, widgets) {
		this.widgets = widgets;

		description = this.removeOptions(description);
		this.sanityCheck(description);

		this.descriptors = description;

		Object.each(description, function(expected, elementName) {
			this.assertions.push(this.generateAssertion(elementName, expected));
		}, this);
	},

	/**
	*@see	AbstractStep#start
	*/
	start: function start() {
		var assertionsPromises = this.assertions.map(function(assertion) {
			return assertion();
		});

		promises.all(assertionsPromises)
				.then(
					this.succeed.bind(this),
					this.fail.bind(this)
				).end();
	},

	/** Parses local options (i.e. the ones specific to this state assertion) and removes them from the given description.
	*
	*@param		{Hash.<String, ?>}	description	A state assertion hash.
	*@returns	{Hash.<String, ?>}	The same assertion hash, with its options removed.
	*/
	removeOptions: function removeOptions(description) {
		if (description.hasOwnProperty('timeout')) {
			this.timeout = description.timeout;
			delete description.timeout;	// we don't want to iterate over this property!
		}

		return description;
	},

	/** Checks that the given state assertions are valid.
	*
	*@throws	{ReferenceError}
	*/
	sanityCheck: function sanityCheck(description) {
		Object.each(description, function(expected, attribute) {
			// unfortunately, we can't cache elements, since WebDriverJS matches elements to the current page once and for all. We'll have to ask access on the page on which the assertion will take place.
			if (! Object.hasPropertyPath(this.widgets, attribute)) {	// the user referenced a non-existing element
				throw new ReferenceError(
					'Could not find "' + attribute + '" in available widgets.\n'
					+ 'Are you sure you spelled the property path properly?'
				);
			}

			if (! Object.hasGetter(this.widgets, attribute)) {	// the user referenced a magically-added attribute, not an element
				throw new ReferenceError(
					'"' + attribute + '" is a shortcut, not an element. It can not be used in an assertion description.\n'
					+ 'You should target a key referenced in the `elements` hash of the "' + attribute.split('.')[0] + '" widget.'
				);
			}
		}, this);
	},

	/**
	*@param		{String}	elementName	The widget element whose content is to be evaluated.
	*@param		{?}			expected	The expected value for the element content. This is currently a String, but could change when new matchers are added.
	*@returns	{Function}	A promise-returning function.
	*@private
	*/
	generateAssertion: function generateAssertion(elementName, expected) {	// TODO: model this in a class
		var activeMatchers	= [],
			failures		= [],
			deferred		= promises.defer();

		stateMatchers.allFor(expected).each(function(matcherClass) {
			var matcher = new matcherClass(expected, elementName, this.widgets);
			activeMatchers.push(matcher);
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

		return function evaluateStateDescriptorMatchers() {	// this is an "instance"
			this.emit('descriptor', deferred.promise, elementName, expected);

			activeMatchers.each(function(matcher) {
				matcher.test(this.timeout)
					   .then(finish, handleFailure)
					   .end();	// rethrow any exception
			}, this);

			return deferred.promise;
		}.bind(this);
	}
});


module.exports = StateStep;	// CommonJS export
