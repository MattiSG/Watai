var promises = require('q');


var FunctionalStep = new Class({
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
		if (this.action.widget) {	// this is a Widget action
			return this.describeAction();
		} else if (this.action.name) {	// this is a custom user function, hopefully the user provided a good name for it
			var humanized = this.action.name.humanize();

			if (humanized != this.action.name)
				humanized += ' (as ' + this.action.name + ')';

			return humanized;
		}

		return '[unnamed action]';
	},

	/** Tries to describe the wrapped step, assuming it is a Widget-generated action.
	*
	*@returns	{String}	A user-presentable action description.
	*@see	Widget
	*/
	describeAction: function describeAction() {
		var humanizedAction = (this.action.title || this.action.reference).humanize()	// makes naming functions themselves optional, but let them have higher precedence over widget key: users can thus provide more details in function names without making it long to access them in tests

		return	this.action.widget
				+ ' '
				+ humanizedAction
				+ (this.action.args.length
					? ' with "' + this.action.args.join('", "') + '"'
					: '')
				+ (humanizedAction != this.action.reference	// make it easier to locate source
					? ' (as ' + this.action.widget + '.' + this.action.reference + ')'
					: '')
	}
});


module.exports = FunctionalStep;	// CommonJS export
