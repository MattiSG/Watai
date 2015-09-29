var promises	= require('q'),
	assert		= require('assert'),
	winston		= require('winston');

var steps		= require('./steps');


var Scenario = new Class( /** @lends Scenario# */ {

	Extends: require('events').EventEmitter,

	/** Constructed after the scenario for this scenario.
	*
	*@type	{Array.<Step>}
	*@private
	*/
	steps: [],

	/** The reasons for failures of the steps.
	*
	*@type	{Array.<Step>}
	*@private
	*/
	reasons: [],

	/** A hash with all components accessible to this Scenario, indexed on their names.
	*
	*@type	{Object.<String, Component>}
	*@see	Component
	*@private
	*/
	components: {},

	/** The user-provided scenario name.
	*
	*@type	{String}
	*/
	description: '',

	/** A numerical identifier that the user can easily identify.
	*
	*@type	{Number}
	*/
	id: 0,

	promise: null,

	/**@class	A Scenario models a sequence of actions to be executed through Components.
	*
	* A scenario description file contains a simple descriptive array listing component methods to execute and component state descriptors to assert.
	* More formally, such an array is ordered and its members may be:
	* - a closure;
	* - an object whose keys are some components' attributes identifiers (ex: "MyComponent.myAttr"), pointing at a string that contains the expected text content of the HTML element represented by the `myAttr` locator in `MyComponent`.
	*
	* Upon instantiation, a Scenario translates this array into an array of promises:
	* - closures are executed directly, either as promises if they are so themselves, or as basic functions;
	* - a component state describing hash maps each of its members to an assertion inside a promise, evaluating all of them asynchronously.
	* All those promises are then evaluated sequentially upon calling the `test` method of a Scenario.
	*
	*@constructs
	*@param	{String}	description	A plain text description of the scenario, advised to be written in a BDD fashion.
	*@param	{Array}		stepsArray	An array that describes states and transitions. See class documentation for formatting.
	*@param	{Object.<String, Component>}	components	A hash listing all components accessible to this Scenario, indexed on their names.
	*@param	{Hash}		config		The test-suite-level configuration elements.
	*@param	{Number}	[id]		The numerical identifier of this scenario.
	*/
	initialize: function init(description, stepsArray, components, config, id) {
		this.description	= description;
		this.id				= id || 0;
		this.config			= config;
		this.components		= components;	// TODO: transform so that they can be referred to with the "Component" suffix optional?

		this.steps			= this.loadSteps(stepsArray);
	},

	/** Parses an array that describes states and transitions and transforms it into a sequence of promises to be evaluated.
	*
	*@param		{Array}	stepsArray	An array that describes states and transitions. See class documentation for formatting.
	*@returns	{Array.<function>}	An array of promises representing the given steps.
	*@private
	*/
	loadSteps: function loadSteps(stepsArray) {
		var result = [];

		for (var stepIndex = 0; stepIndex < stepsArray.length; stepIndex++) {
			var sourceStep = stepsArray[stepIndex],
				step = null;	// this is going to be an actual AbstractStep-inheriting instance

			winston.loggers.get('load').silly('Loading step ' + stepIndex + ' (source type: ' + typeof sourceStep + ', full source: ' + sourceStep + ')…');

			switch (typeof sourceStep) {
				case 'function':
					step = new steps.FunctionalStep(sourceStep);
					break;
				case 'object':	// if this is a Hash, it is a state description
					if (! sourceStep)	// yep, typeof null == 'object'  :)
						break;	// do nothing, but make sure step is not defined, and that we eliminated any risk of using an illegal sourceStep

					step = new steps.StateStep(sourceStep, this.components);
					break;
				case 'string':
				case 'number':
					winston.loggers.get('load').debug('Oops, encoutered "' + sourceStep + '" as a free step!'	// TODO: remove this hint after v0.4
							 + '\n'
							 + 'Maybe your test is still using pre-0.4 syntax?  :)'
							 + '\n'
							 + 'Since v0.4, action parameters are passed directly as a function call.'
							 + '\n'
							 + 'For more details, see the Scenarios syntax reference: https://github.com/MattiSG/Watai/wiki/Scenarios');
					break;
			}

			if (! step)
				this.notifySyntaxError('step value ("' + sourceStep + '") is illegal!', stepIndex);

			winston.loggers.get('load').silly('Loaded step ' + stepIndex + ' as ' + step);

			result.push(step);
		}

		return result;
	},

	/** Notifies the user that there was a syntax error in the scenario description file.
	*
	*@param	{String}	message	A description of the syntax error that was detected
	*@param	{Number}	[stepIndex]	The scenario step (0-based) at which the syntax error was detected. If not defined, the syntax error will be described as global to the scenario file.
	*/
	notifySyntaxError: function notifySyntaxError(message, stepIndex) {
		throw new SyntaxError(
			'Scenario "' + this.description + '"'
			+ (typeof stepIndex != 'undefined'	// we can't simply test for falsiness, since the stepIndex could be 0
				? ', at step ' + (stepIndex + 1)
				: '')
			+ (message
				? ': ' + message
				: '')
		);
	},

	/** Asynchronously evaluates the scenario given to this scenario.
	*
	*@returns	{QPromise}	A promise that will be either:
	*	- rejected if any assertion or action fails, passing an array of strings that describe reason(s) for failure(s) (one reason per item in the array).
	*	- resolved if all assertions pass, with this scenario as a parameter.
	*/
	test: function test() {
		var deferred = promises.defer(),
			stepIndex = -1,
			evaluateNext;

		evaluateNext = (function evalNext() {
			stepIndex++;

			if (stepIndex == this.steps.length) {
				if (this.reasons.length)
					return deferred.reject(this.reasons);

				return deferred.resolve(this);
			}

			var step = this.steps[stepIndex];

			this.emit('step', step, stepIndex);

			step.test(this.config.timeout)
				.fail(this.reasons.push.bind(this.reasons))
				.fin(process.nextTick.bind(process, evaluateNext))
				.done();
		}).bind(this);

		this.promise = deferred.promise;

		this.emit('start', this);

		process.nextTick(evaluateNext);	// all other steps will be async, decrease discrepancies and give control back ASAP

		return this.promise;
	},

	toString: function toString() {
		return this.description;
	}
});


module.exports = Scenario;	// CommonJS export
