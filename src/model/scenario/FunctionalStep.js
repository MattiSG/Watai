var promises = require('q');


var FunctionalStep = new Class({
	Extends: require('./AbstractStep'),

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
		return (this.getDescription()
				+ ' failed'
				+ (report
					? ', returning "' + report + '"'
					: '')
				);
	},

	/**
	*@see	AbstractStep#getDescription
	*/
	getDescription: function getDescription() {
		if (this.action.widget)	// this is a Widget action
			return this.describeAction();

		// this is a custom user function, hopefully the user provided a good name for it
		return this.action.name || '[unnamed action]';
	},

	/** Tries to describe the wrapped step, assuming it is a Widget-generated action.
	*
	*@returns	{String}	A user-presentable action description.
	*@see	Widget
	*/
	describeAction: function describeAction() {
		return	this.action.widget
				+ ' '
				+ (this.action.title || this.action.element).humanize()	// makes naming functions themselves optional, but let them have higher precedence: users can thus provide details
				+ (this.action.args
					? ' ' + this.action.args
					: '')
				+ (this.action.title != this.action.element
					? ' (as ' + this.action.element + ')'
					: '');
	}
});


module.exports = FunctionalStep;	// CommonJS export
