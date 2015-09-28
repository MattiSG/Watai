var promises = require('q');

/**@class	A step that parses and evaluates a function in a scenario.
* A function may be a component action, or a user-provided function.
*
*@extends	steps.AbstractStep
*@memberOf	steps
*/
var FunctionalStep = new Class(/** @lends steps.FunctionalStep# */{
	Extends: require('./AbstractStep'),

	type: 'functional',

	/** A function, promise-returning or not, to be executed. If it throws, or returns a rejected promise, this step will fail. Otherwise, it will succeed.
	*
	*@type	{Function}
	*@private
	*/
	action: null,

	/**
	*@param	{Function}	action	A function, promise-returning or not, to be executed. If it throws, or returns a rejected promise, this step will fail. Otherwise, it will succeed.
	*@constructs
	*/
	initialize: function init(action) {
		this.action = action;
	},

	start: function start() {
		promises.fcall(this.action)
				.done(this.succeed.bind(this), this.fail.bind(this));
	},

	formatFailure: function formatFailure(report) {
		return (this
				+ ' failed'
				+ (report
					? ', returning "' + report + '"'
					: '')
				);
	},

	toString: function toString() {
		if (this.action.component) {	// this is a Component action
			return this.describeAction();
		} else if (this.action.name) {	// this is a custom user function, hopefully the user provided a good name for it
			var humanized = this.action.name.humanize();

			if (humanized != this.action.name)
				humanized += ' (as ' + this.action.name + ')';

			return humanized;
		}

		return '[unnamed action]';
	},

	/** Tries to describe the wrapped step, assuming it is a Component-generated action.
	*
	*@returns	{String}	A user-presentable action description.
	*@see	Component
	*/
	describeAction: function describeAction() {
		var humanizedAction = (this.action.title || this.action.reference).humanize()	// makes naming functions themselves optional, but let them have higher precedence over component key: users can thus provide more details in function names without making it long to access them in tests

		return	this.action.component
				+ ' '
				+ humanizedAction
				+ (this.action.args.length
					? ' with "' + this.action.args.join('", "') + '"'
					: '')
				+ (humanizedAction != this.action.reference	// make it easier to locate source
					? ' (as ' + this.action.component + '.' + this.action.reference + ')'
					: '')
	}
});


module.exports = FunctionalStep;	// CommonJS export
