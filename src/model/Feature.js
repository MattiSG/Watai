var promises = require('q'),
	assert = require('assert');


/** A Feature models a sequence of actions to be executed through Widgets.
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
module.exports = new Class({
	/** A sequence of promises to be executed in order, constructed after the scenario for this feature.
	*/
	steps: [],
	
	/**
	*@param	description	A plaintext description of the feature, advised to be written in a BDD fashion.
	*@param	scenario	An array that describes states and transitions.
	*/
	initialize: function init(description, scenario) {
		this.description = description;
		
		this.loadScenario(scenario);
	},
	
	loadScenario: function loadScenario(scenario) {
		scenario.forEach(function(step) {
			this.steps.push(this.promiseStep(step));
		}, this);
	},
	
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
	
	/**
	*@param	hooksVals	A hash whose keys match some widgets' attributes, pointing at values that are expected values for those attributes.
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
	
	/** Evaluate this feature.
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
					return deferred.reject(failureReasons.join('\n'));
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
