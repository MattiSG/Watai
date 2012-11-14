var promises = require('q'),
	assert = require('assert');

var logger = require('winston').loggers.get('steps'),
	matchers = require('./scenario/state'),
	steps = require('./scenario'),
	config = require('../lib/configManager');


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
			var sourceStep = scenario[stepIndex], // takes all values listed in a scenario
				step;	// this is going to be an actual AbstractStep-inheriting instance

			if (! sourceStep) {
				// do nothing, but make sure step is not defined, and that we eliminated any risk of using an illegal sourceStep
				// for example, typeof null == 'object', so checking sourceStep in all cases would be repetitive
			} else if (typeof sourceStep == 'object') {	// if this is a Hash, it is a state description
				step = this.buildAssertionPromise(sourceStep);
			} else if (typeof sourceStep == 'function') {
				var paramsCount = sourceStep.length;	// arity of the function

				var params = scenario.splice(stepIndex + 1, paramsCount);

				step = this.buildFunctionalPromise(sourceStep, params, stepIndex);
			}

			if (! step)
				this.notifySyntaxError('step value ("' + sourceStep + '") is illegal!', stepIndex);
			
			result.push(step);
		}

		return result;
	},

	/** Normalizes an operational closure (i.e. a function that modifies a widget's state) to a format compatible with scenario steps execution.
	*
	*@param	{Function}	func	The raw function to execute.
	*@param	{Array}		params	Parameters to bind to this function.
	*@param	{Number}	[stepIndex]	The step at which this function is parsed. Used for user-level debugging, in case an error is detected in the function.
	*@returns	{Function}	A bound function, ready for execution as a step.
	*@private
	*/
	buildFunctionalPromise: function buildFunctionalPromise(func, params, stepIndex) {
		if (func.length != params.length) {
			var msg = 'A bad number of parameters has been given to the function';
			if (func.name)
				msg += ' "' + func.name + '"';

			this.notifySyntaxError(msg, stepIndex)
		}

		var step = new steps.FunctionalStep(func, params);

		return step.test.bind(step);
	},

	/** Notifies the user that there was a syntax error in the feature description file.
	*
	*@param	{String}	message	A description of the syntax error that was detected
	*@param	{Number}	[stepIndex]	The scenario step (0-based) at which the syntax error was detected. If not defined, the syntax error will be described as global to the feature file.
	*/
	notifySyntaxError: function notifySyntaxError(message, stepIndex) {
		throw new SyntaxError('Feature "' + this.description + '"'
							  + (typeof stepIndex != 'undefined'	// we can't simply test for falsiness, since the stepIndex could be 0
							  	? ', at step ' + (stepIndex + 1)
							  	: '')
							  + (message ?	': ' : '')
							  +  message);
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
			timeout;	// per-state timeouts. This is independent from implicit waits for elements to appear: this timeout is how long we should wait for a match on a preexistent element

		if (hooksVals.hasOwnProperty('timeout')) {
			timeout = hooksVals.timeout;
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
			var checkStateDescriptionFulfilled = function checkStateDescriptionFulfilled(error) {
				if (error)	// TODO: add a "evaluateAll" option that would reject only after having collected result for all descriptors, not fail on the first failure
					evaluator.reject(error);

				if (--matchesLeft == 0)
					evaluator.resolve();
			}

			Object.each(hooksVals, function(expected, elementSelector) {
				isEmpty = false;

				this.evaluateStateDescriptor(elementSelector, expected, checkStateDescriptionFulfilled, timeout);
			}, this);

			if (isEmpty)
				evaluator.resolve();

			return evaluator.promise;
		}).bind(this);
	},

	/**
	*@param	elementSelector	The widget element whose content is to be evaluated.
	*@param	expected	The expected value for the element content. This is currently a String, but could change when new matchers are added.
	*@param	{Function}	callback	A function to call once the evaluation has ended. Params: {Boolean} was there a match?, {String?} message to justify the result (typically expected/actual comparison).
	*@param	{Number}	[timeout]	Maximum time, in milliseconds, after which the lack of match will be considered as a failure.
	*@private
	*/
	evaluateStateDescriptor: function evaluateStateDescriptor(elementSelector, expected, callback, timeout) {
		var activeMatchers = [];

		if (typeof expected == 'boolean') {	// TODO: make matchers responsible for defining which value types they can handle instead of this horrendous switch
			activeMatchers.push(new matchers.ExistenceMatcher(this.widgets, elementSelector, expected));
		} else if (expected.constructor && expected.constructor.name === 'RegExp') {	// since elements are loaded in a separate context, the `instanceof` fails, as it compares constructors references
			activeMatchers.push(new matchers.RegExpTextMatcher(this.widgets, elementSelector, expected));
		} else {
			activeMatchers.push(new matchers.TextMatcher(this.widgets, elementSelector, expected));
			activeMatchers.push(new matchers.ValueMatcher(this.widgets, elementSelector, expected));
		}

		var matchersLeft = activeMatchers.length;

		function finish(message) {
			activeMatchers.each(function(matcher) {	// first we need to make sure no failed matcher is going to try again to match even after another ended the evaluation
				matcher.cancel();
			});

			callback(message);	// then we actually call the callback
		}

		function handleSuccess() {
			finish();
		}

		function handleFailure(message) {
			if (--matchersLeft <= 0)
				finish(message)
		}

		activeMatchers.each(function(matcher) {
			matcher.test(timeout)
				   .then(handleSuccess, handleFailure)
				   .end();	// rethrow any exception
		});

		if (activeMatchers.length <= 0)
			throw new Error('No matcher found for the given value type  :-/  (had to check for "' + expected + '").');
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

		var handleFailure = function handleFailure(message, step) {
			failureReasons.failures.push(message + ' (at step ' + (step + 1) + ')');	// make user-visible indices 1-based
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
				if (result && typeof result.then == 'function') {
					result.then(evaluateNext, function(message) {
						handleFailure(message, stepIndex)
					}).end();
				} else {
					evaluateNext();
				}
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
