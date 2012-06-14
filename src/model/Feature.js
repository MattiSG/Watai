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
	*@private
	*/
	steps: [],
	
	/** A hash with all widgets accessible to this Feature, indexed on their names.
	*@type	{Object.<String, Widget>}
	*@see	Widget
	*@private
	*/
	widgets: {},
	
	/** 
	*
	*@param	{String}	description	A plaintext description of the feature, advised to be written in a BDD fashion.
	*@param	{Array}		scenario	An array that describes states and transitions. See class documentation for formatting.
	*@param	{Object.<String, Widget>}	widgets	A hash listing all widgets accessible to this Feature, indexed on their names.
	*/
	initialize: function init(description, scenario, widgets) {
		this.description = description;
		
		this.widgets = widgets;
		
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
			 * Therefore, steps in the scenario are clean of any protoype augmentation.
			 * MooTools, for example, allows proper type introspection through prototype augmentation. This is not usable here.
			 * But we still need to do introspection to offer proper heuristics. Tricks to achieve this are below.
			 */
			result.push(	step instanceof Function ?
							step
						  : typeof step == 'object' && step.length >= 0 ?	// an Array have a length property, not an Object; as a consequence, `length` is a reserved property for state description hashes
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
		return func.apply.bind(func, null, params);	//TODO: handle errors like `func` not being a function
	},
	
	/** Parses a widget state description and creates an assertive closure returning the promise for assertions results upon evaluation.
	*
	*@private
	*@param		{Object}	hooksVals	A hash whose keys match some widgets' attributes, pointing at values that are expected values for those attributes.
	*@returns	{function}	A parameter-less closure asserting the described state and returning a promise that will be either:
	*	- rejected if any assertion fails, passing a string parameter that describes the first failed match;
	*	- resolved if all assertions pass, with no parameter.
	*/
	buildAssertionPromise: function buildAssertionPromise(hooksVals) {
		var widgets = this.widgets;	// making the closure complete for later evaluation
		
		return function() {
			var evaluator = promises.defer(),
				matchesLeft = Object.getLength(hooksVals);

			Object.each(hooksVals, function(expected, attribute) {
				var target = Object.getFromPath(widgets, attribute);
				
				target.getText().then(function(actual) {
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
			stepIndex = -1;
		
		var evaluateNext,
			failureReasons = [];
		
		var handleFailure = function handleFailure(message) {
			failureReasons.push(message);
			evaluateNext();
		}
		
		evaluateNext = (function(value) {
			stepIndex++;

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
		}).bind(this);
		
		evaluateNext();
		
		return deferred.promise;
	}
});


module.exports = Feature;	// CommonJS export
