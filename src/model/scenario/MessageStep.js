var MessageStep = new Class({
	Extends: require('./AbstractStep'),

	/**
	*@param	{String}	message	A user-visible message.
	*/
	initialize: function init(message) {
		this.message = message;
	},

	start: function start() {
		console.log(this.message);	//TODO: use loggers
		this.succeed();
	}
});


module.exports = MessageStep;	// CommonJS export
