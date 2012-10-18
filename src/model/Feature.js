var promises = require('q'),
	assert = require('assert');

var logger = require('winston').loggers.get('steps');


/** How long to wait for a state descriptor to get a match.
* Expressed in milliseconds.
*
*@type	{Number}
*@const
*@private
*/
var DEFAULT_MATCH_TIMEOUT = 500;

/** How long to wait between each try for a match in a state descriptor.
* Until the match timeout expires, each element that did not match its expected value will be accessed on that interval.
* Expressed in milliseconds.
*
*@type	{Number}
*@const
*@private
*/
var MATCH_TRY_DELAY = 100;


var Feature = new Class( /** @lends Feature# */ {
	/** A sequence of promises to be executed in order, constructed after the scenario for this feature.
	*@private
	*/
	steps: [],

	/** A hash with all widgets accessible to this Feature, indexed on their names.
	*@type	{Object.<String, Widget>}
	*@see	Widget
	*@private
	*/
	widgets: {},

	/**@class	A Feature models a sequence of actions to be executed through Widgets.
	*
	* A feature description file contains a simple descriptive array listing widget methods to execute and widget state descriptors to assert.
	* More formally, such an array is ordered and its members may be:
	* - a closure;
	* - an object whose keys are some widgets' attributes identifiers (ex: "MyWidget.myAttr"), pointing at a string that contains the expected text content of the HTML element represented by the `myAttr` hook in `MyWidget`.
	*
	* Upon instantiation, a Feature translates this array into an array of promises:
	* - closures are executed directly, either as promises if they are so themselves, or as basic functions;
	* - a widget state describing hash maps each of its members to an assertion inside a promise, evaluating all of them asynchronously.
	* All those promises are then evaluated sequentially upon calling the `test` method of a Feature.
	*
	*@constructs
	*@param	{String}	description	A plain text description of the feature, advised to be written in a BDD fashion.
	*@param	{Array}		scenario	An array that describes states and transitions. See class documentation for formatting.
	*@param	{Object.<String, Widget>}	widgets	A hash listing all widgets accessible to this Feature, indexed on their names.
	*/
	initialize: function init(description, scenario, widgets) {
		this.description = description;

		this.widgets = widgets;	//TODO: transform so that they can be referred to with the "Widget" suffix optional?

		this.steps = this.loadScenario(scenario);
	},

	/** Parses an array that describes states and transitions and transforms it into a sequence of promises to be evaluated.
	*
	*@param		{Array}	scenario	An array that describes states and transitions. See class documentation for formatting.
	*@returns	{Array.<function>}	An array of promises representing the given scenario.
	*@private
	*/
	loadScenario: function loadScenario(scenario) {
		var result = [];

		for (var stepIndex = 0; stepIndex < scenario.length; stepIndex++) {
			var step = scenario[stepIndex]; // takes all values listed in a scenario

			/* So, this is going to be a bit hard. Stay with me  ;)
			 * Scenarios are loaded in a different context, absolutely clean by default (see SuiteLoader).
			 * Therefore, steps in the scenario are clean of any prototype augmentation.
			 * MooTools, for example, allows proper type introspection through prototype augmentation. This is not usable here.
			 * But we still need to do introspection to offer proper heuristics. Tricks to achieve this are below.
			 */
			result.push(	typeof step == 'function' ?
							step
						  : typeof step == 'object' && step.length >= 0 ?	// an Array has a length property, not an Object; as a consequence, `length` is a reserved property for state description hashes
						    this.buildFunctionalPromise(result.pop(), step)
						  : typeof step == 'object' ?
						    this.buildAssertionPromise(step) // if this is a Hash, it is a description value
						  : this.buildFunctionalPromise(result.pop(), [ step ])	// default: this is a primitive value, we normalize it by wrapping
						);
		}

		return result;
	},

	/** Normalizes an operational closure (i.e. a function that modifies a widget's state) to a format compatible with scenario steps execution.
	*
	*@param	{Function}	func	The raw function to execute.
	*@param	{Array}		params	Parameters to bind to this function.
	*@returns	{Function}	A bound function, ready for execution as a step.
	*@private
	*/
	buildFunctionalPromise: function buildFunctionalPromise(func, params) {
		return func.apply.bind(func, null, params);
	},

	/** Parses a widget state description and creates an assertive closure returning the promise for assertions results upon evaluation.
	*
	*@param		{Object}	hooksVals	A hash whose keys match some widgets' attributes, pointing at values that are expected values for those attributes.
	*@returns	{function}	A parameter-less closure asserting the described state and returning a promise that will be either:
	*	- rejected if any assertion fails, passing a string parameter that describes the first failed match;
	*	- resolved if all assertions pass, with no parameter.
	*@private
	*/
	buildAssertionPromise: function buildAssertionPromise(hooksVals) {
		var matchesLeft = 0,	// optimization: we're using the check loop beneath to cache the count of elements to match
			timeout = DEFAULT_MATCH_TIMEOUT;	// per-state timeouts; default to no timeout. This is independent from implicit waits for elements to appear: this timeout is how long we should wait for a match on a preexistent element

		if (hooksVals.timeout) {
			timeout = hooksVals.timeout * 1000;	// user expresses in seconds, we convert to milliseconds
			delete hooksVals.timeout;	// we don't want to iterate over this property!
		}

		Object.each(hooksVals, function(expected, attribute) {
			matchesLeft++;

			if (! Object.hasPropertyPath(this.widgets, attribute)) {	// unfortunately, we can't cache this, since WebDriverJS matches elements to the current page once and for all. We'll have to ask access on the page on which the assertion will take place.
				logger.error('Could not find "' + attribute + '" in available widgets. Are you sure you spelled the property path properly?', { widgets: this.widgets });
				throw new Error('Could not find "' + attribute + '" in available widgets');
			}
		}, this);

		return (function() {
			var evaluator = promises.defer();

			var isEmpty = true;	// yep, we have to treat the special case of {}

			/** Callback called after each state descriptor evaluation.
			* Controls the promise fulfilment.
			*@param	{Boolean}	success	Whether the state descriptor assertion got a match or not.
			*@param	{String}	message	Any additional information the assertion found. Will be passed to the promise.
			*/
			var checkStateDescriptionFulfilled = function checkStateDescriptionFulfilled(success, message) {
				if (! success)	// TODO: add a "evaluateAll" option that would reject only after having collected result for all descriptors, not fail on the first failure
					evaluator.reject(message);

				if (--matchesLeft == 0)
					evaluator.resolve();
			}

			Object.each(hooksVals, function(expected, elementSelector) {
				isEmpty = false;

				this.evaluateStateDescriptor(elementSelector, expected, timeout, checkStateDescriptionFulfilled);
			}, this);

			if (isEmpty)
				evaluator.resolve();

			return evaluator.promise;
		}).bind(this);
	},

	/**
	*@param	elementSelector	The widget element whose content is to be evaluated.
	*@param	expected	The expected value for the element content. This is currently a String, but could change when new matchers are added.
	*@param	{Number}	Maximum time, in milliseconds, after which the lack of match will be considered as a failure.
	*@param	{Function}	callback	A function to call once the evaluation has ended. Params: {Boolean} was there a match?, {String?} message to justify the result (typically expected/actual comparison)
	*@private
	*/
	evaluateStateDescriptor: function evaluateStateDescriptor(elementSelector, expected, timeout, callback) {
		var evaluate,
			original,	// the first value of the element
			firstTryTimestamp = new Date();	// to compute the maximal match timeout

		function compareTo(actual) {
			if (actual == expected)
				return callback(true);

			if (typeof original == 'undefined')
				original = actual;	// this is used to wait for a _change_ in the element value rather than for a match.

			if (original != actual)	// there was a value change, but not the one we expected
				return callback(false, elementSelector + ' changed its value to "' + actual + '" rather than to "' + expected + '".');

			if (new Date() - firstTryTimestamp >= timeout)	// the timeout expired
				return callback(false, 'After ' + timeout + ' milliseconds, the value of "' + elementSelector + '" was still "' + actual + '" and not "' + expected + '".')

			evaluate.delay(MATCH_TRY_DELAY);
		}

		Object.getFromPath(this.widgets, elementSelector).then(function(target) {
			evaluate = function() {
				target.getText().then(function(text) {
						if (text) {	//TODO: refactor to use an array of methods to check sequentially
							compareTo(text);
						} else {	// it could be that it is an input field and we need to compare the value
							target.getAttribute('value')
								  .then(compareTo,
										callback.pass([false, 'Could not get value from element "' + elementSelector + '".']));
						}
					},
					callback.pass([false, 'Could not get text from element "' + elementSelector + '".'])
				);
			}	// end of `evaluate` definition

			evaluate();
		}, callback.pass([false, 'Element "' + elementSelector + '" does not exist on the page.']));
	},

	/** Asynchronously evaluates the scenario given to this feature.
	*
	*@returns	{Promise}	A promise that will be either:
	*	- rejected if any assertion or action fails, passing a hash containing two keys:
	*		• `failures`: an array of strings that describe reason(s) for failure(s) (one reason per item in the array);
	*		• `errors`: an array of strings that describe errors that arose when trying to evaluate the feature.
	*	- resolved if all assertions pass, with no parameter.
	*/
	test: function evaluate() {
		var deferred = promises.defer(),
			stepIndex = -1;

		var evaluateNext,
			failureReasons = {
				failures: [],	// we differentiate between the two types
				errors: []
			};

		var handleFailure = function handleFailure(message) {
			failureReasons.failures.push(message);
			evaluateNext();
		}

		function fulfillPromise(report) {
			if (report.failures.length || report.errors.length)
				return deferred.reject(report);
			else
				return deferred.resolve();
		}

		evaluateNext = (function evalNext() {
			stepIndex++;

			if (stepIndex == this.steps.length)
				return fulfillPromise(failureReasons);

			try {
				var result = this.steps[stepIndex]();
				// unfortunately, [q.when](https://github.com/kriskowal/q#the-middle) is not compatible with WebDriver's Promises/A implementation, and we need to explicitly call `then` to reject thrown exceptions
				if (result && typeof result.then == 'function')
					result.then(evaluateNext, handleFailure);
				else
					evaluateNext();

			} catch (error) {
				failureReasons.errors.push(error);
				evaluateNext();
			}
		}).bind(this);

		evaluateNext();	//TODO: make async

		return deferred.promise;
	}
});


module.exports = Feature;	// CommonJS export
