var promises = require('q'),
	assert = require('assert');


/**@class	A Feature models a sequence of actions to be executed through Widgets.
* 
* A feature description file contains a simple descriptive array listing widget methods to execute and widget state descriptors to assert.
* More formally, such an array is ordered and its members may be:
* - a closure;
* - an object whose keys are some widgets' attributes identifiers (ex: "MyWidget.myAttr"), pointing at a string that contains the expected text content of the HTML element represented by the `myAttr` hook in `MyWidget`.
*
* Upon instanciation, a Feature translates this array into an array of promises:
* - closures are executed directly, either as promises if they are so themselves, or as basic functions;
* - a widget state descripting hash maps each of its members to an assertion inside a promise, evaluating all of them completely asynchronously.
* All those promises are then evaluated sequentially upon calling the `test` method of a Feature.
*/
var Feature = new Class({
	/** A sequence of promises to be executed in order, constructed after the scenario for this feature.
	*
	*@private
	*/
	steps: [],
	
	/**
	*
	*@param	{String}	description	A plaintext description of the feature, advised to be written in a BDD fashion.
	*@param	{Array}		scenario	An array that describes states and transitions. See class documentation for formatting.
	*/
	initialize: function init(description, scenario) {
		this.description = description;
		
		this.steps = this.loadScenario(scenario);
	},
	
	/** Parses an array that describes states and transitions and transforms it into a sequence of promises to be evaluated.
	*
	*@private
	*@param		{Array}	scenario	An array that describes states and transitions. See class documentation for formatting.
	*@returns	{Array.<function>}	An array of promises representing the given scenario.
	*/
	loadScenario: function loadScenario(scenario) {
		var result = [];
		
		scenario.forEach(function(step) {
			result.push(this.promiseStep(step));
		}, this);
		
		return result;
	},
	
	/** Parses a scenario step and returns the corresponding promise.
	*
	*@private
	*@param		{function|object}	step	Either a widget method or an object describing a widget state.
	*@returns	{function}	A closure returing an evaluatable promise for an asynchronous action.
	*/
	promiseStep: function promiseStep(step) {
		switch (typeOf(step)) {
			case 'function':
				return step;
			case 'object':
				return this.constructMatchAssertion(step);
			default:
				throw 'Unknown description step in feature "' + this.description + '": ' + step;
		}
	},
	
	/** Parses a widget state description and creates an assertive closure returning the promise for assertions results upon evaluation.
	*
	*@private
	*@param		{Object}	hooksVals	A hash whose keys match some widgets' attributes, pointing at values that are expected values for those attributes.
	*@returns	{function}	A parameter-less closure asserting the described state and returning a promise that will be either:
	*	- rejected if any assertion fails, passing a string parameter that describes the first failed match;
	*	- resolved if all assertions pass, with no parameter.
	*/
	constructMatchAssertion: function constructMatchAssertion(hooksVals) {
		return function() {
			var evaluator = promises.defer(),
				matchesLeft = Object.getLength(hooksVals);

			Object.each(hooksVals, function(expected, attribute) {
				eval(attribute).getText().then(function(actual) { //TODO: replace eval with an object walker
					if (expected != actual)
						evaluator.reject(attribute + ' was "' + actual + '" instead of "' + expected + '"');
						
					if (--matchesLeft == 0)
						evaluator.resolve();
				});
			});
			
			return evaluator.promise;
		}
	},
	
	/** Asynchronously evaluates the scenario given to this feature.
	*
	*@returns	{Promise}	A promise that will be either:
	*	- rejected if any assertion or action fails, passing an array of strings that describe reason(s) for failure(s) (one reason per item in the array);
	*	- resolved if all assertions pass, with no parameter.
	*/
	test: function evaluate() {
		var deferred = promises.defer(),
			stepIndex = 0;
		
		var evaluateNext,
			failureReasons = [];
		
		var handleFailure = function handleFailure(message) {
			failureReasons.push(message);
			evaluateNext();
		}
		
		evaluateNext = (function(value) {
			if (stepIndex == this.steps.length) {
				if (failureReasons.length == 0)
					return deferred.resolve();
				else
					return deferred.reject(failureReasons);
			}
			
			try {
				promises.when(this.steps[stepIndex](),
							  evaluateNext,
							  handleFailure);
			} catch (error) {
				handleFailure(error);
			}
			
			stepIndex++;
		}).bind(this);
		
		evaluateNext();
		
		return deferred.promise;
	}
});


module.exports = Feature;	// CommonJS export
