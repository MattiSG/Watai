var promises = require('q'),
	assert = require('assert');

var steps = require('./scenario'),
	ConfigManager = require('../lib/configManager');


var Feature = new Class( /** @lends Feature# */ {

	Extends: require('events').EventEmitter,

	/** Constructed after the scenario for this feature.
	*
	*@type	{Array.<Step>}
	*@private
	*/
	steps: [],

	/** The steps that failed.
	*
	*@type	{Array.<Step>}
	*@private
	*/
	failedSteps: [],

	/** A hash with all widgets accessible to this Feature, indexed on their names.
	*
	*@type	{Object.<String, Widget>}
	*@see	Widget
	*@private
	*/
	widgets: {},

	/** The user-provided feature name.
	*
	*@type	{String}
	*@private
	*/
	description: '',

	promise: null,

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
				step = null;	// this is going to be an actual AbstractStep-inheriting instance

			ConfigManager.getLogger('load').silly('Loading step ' + stepIndex + ' (source type: ' + typeof sourceStep + ', full source: ' + sourceStep + ')…');

			switch (typeof sourceStep) {
				case 'function':
					step = new steps.FunctionalStep(sourceStep);
					break;
				case 'object':	// if this is a Hash, it is a state description
					if (! sourceStep)	// yep, typeof null == 'object'  :)
						break;	// do nothing, but make sure step is not defined, and that we eliminated any risk of using an illegal sourceStep

					step = new steps.StateStep(sourceStep, this.widgets);
					break;
				case 'string':
				case 'number':
					ConfigManager.getLogger('load').debug('Oops, encoutered "' + sourceStep + '" as a free step in a feature scenario!'	// TODO: remove this hint after v0.4
							 + '\n'
							 + 'Maybe your test is still using pre-0.4 syntax?  :)'
							 + '\n'
							 + 'Since v0.4, action parameters are passed directly as a function call.'
							 + '\n'
							 + 'For more details, see the Features syntax reference: https://github.com/MattiSG/Watai/wiki/Features');
					break;
			}

			if (! step)
				this.notifySyntaxError('step value ("' + sourceStep + '") is illegal!', stepIndex);

			ConfigManager.getLogger('load').silly('Loaded step ' + stepIndex + ' as ' + step);

			result.push(step);
		}

		return result;
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
							  + (message
							  	? ': ' + message
							  	: '')
							 );
	},

	/** Asynchronously evaluates the scenario given to this feature.
	*
	*@returns	{Promise}	A promise that will be either:
	*	- rejected if any assertion or action fails, passing an array of strings that describe reason(s) for failure(s) (one reason per item in the array).
	*	- resolved if all assertions pass, with this feature as a parameter.
	*/
	test: function test() {
		var deferred = promises.defer(),
			stepIndex = -1,
			evaluateNext;

		evaluateNext = (function evalNext() {
			stepIndex++;

			if (stepIndex == this.steps.length) {
				if (this.failedSteps.length)
					return deferred.reject(this.failedSteps);

				return deferred.resolve(this);
			}

			var step = this.steps[stepIndex];

			this.emit('step', step, stepIndex);

			step.test()
				.fail(this.failedSteps.push.bind(this.failedSteps))
				.fin(process.nextTick.bind(process, evaluateNext))
				.end();
		}).bind(this);

		this.emit('start', this);

		process.nextTick(evaluateNext);	// all other steps will be aync, decrease discrepancies and give control back ASAP

		return deferred.promise;
	},

	toString: function toString() {
		return this.description;
	}
});


module.exports = Feature;	// CommonJS export
