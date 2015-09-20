var promises = require('q');

var stateMatchers = require('./state');

/**@class	A step that parses and evaluates a component state assertions.
*
*@extends	steps.AbstractStep
*@memberOf	steps
*/
var StateStep = new Class(/** @lends steps.StateStep# */{
	Extends: require('./AbstractStep'),

	type: 'state',

	/** The dictionary of all components within which the given state assertion should be understood.
	*
	*@type	{Hash.<String, Component>}
	*@private
	*/
	components: {},

	/** The original, user-provided state description hash.
	*
	*@type	{Hash.<String, ?>}
	*@private
	*/
	descriptors: {},

	/** The assertions corresponding to the given description hash.
	* An array of promise-returning functions.
	*
	*@type	{Array.<Function>}
	*@private
	*/
	assertions: [],

	/**
	*
	*@param	{Hash.<String, ?>}		description	A state assertion hash.
	*@param	{Hash.<String, Component>}	components		The dictionary of all components within which the given state assertion should be understood.
	*@constructs
	*/
	initialize: function init(description, components) {
		this.components = components;

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

		promises.allSettled(assertionsPromises)
				.done(this.onAllDescriptorsDone.bind(this));
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
			if (! Object.hasPropertyPath(this.components, attribute)) {	// the user referenced a non-existing element
				throw new ReferenceError(
					'Could not find "' + attribute + '" in available components.\n'
					+ 'Are you sure you spelled the property path properly?'
				);
			}

			if (! Object.hasGetter(this.components, attribute)) {	// the user referenced a magically-added attribute, not an element
				throw new ReferenceError(
					'"' + attribute + '" is a shortcut, not an element. It can not be used in an assertion description.\n'
					+ 'You should target a key referenced in the `elements` hash of the "' + attribute.split('.')[0] + '" component.'
				);
			}
		}, this);
	},

	/**
	*@param		{String}	elementName	The component element whose content is to be evaluated.
	*@param		{Object}	expected	The expected value for the element content.
	*@returns	{Function}	A promise-returning function.
	*@private
	*/
	generateAssertion: function generateAssertion(elementName, expected) {
		var deferred		= promises.defer(),
			MatcherClass	= stateMatchers.forValue(expected);

		if (! MatcherClass)
			throw new TypeError('No matcher found for the given value type.\nHad to check for "' + expected + '", which is of type ' + typeof expected + '.');

		var matcher = new MatcherClass(expected, elementName, this.components);

		return function evaluateStateDescriptorMatcher() {
			this.emit('matcher', matcher);

			matcher.test(this.timeout)
				   .done(deferred.resolve, deferred.reject);

			return deferred.promise;
		}.bind(this);
	},

	/** Extracts failures from descriptor promises and calls either `succeed` or `fail` based on this information.
	*
	*@param	{Array.<PromiseSnapshot>}	promiseSnapshots	The snapshots of promises for each state descriptor.
	*@see	Q.allSettled
	*/
	onAllDescriptorsDone: function onAllDescriptorsDone(promiseSnapshots) {
		var failures = [];

		promiseSnapshots.each(function(promiseSnapshot) {
			if (promiseSnapshot.state == 'rejected')
				failures = failures.concat(promiseSnapshot.reason);	// as passed when rejecting a promise from #generateAssertion, this is an array containing reasons of rejection for each matcher
		});

		if (failures.length > 0)
			this.fail(failures);
		else
			this.succeed();
	},

	/**
	*@see	AbstractStep#formatFailure
	*/
	formatFailure: function formatFailure(failures) {
		return '- ' + failures.join('\n- ');
	},

	toString: function toString() {
		return 'State assertion';
	}
});


module.exports = StateStep;	// CommonJS export
